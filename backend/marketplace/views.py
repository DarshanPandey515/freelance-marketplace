from rest_framework.decorators import api_view, permission_classes
from rest_framework.response import Response
from rest_framework import status
from rest_framework.views import APIView
from marketplace.serailizers import LoginSerializer, SignupSerializer, ProjectCreateSerializer, ProjectListSerializer, ProposalCreateSerializer, ProposalSerializer, MyProposalSerializer, ContractSerializer
from rest_framework_simplejwt.tokens import RefreshToken
from rest_framework.permissions import AllowAny, IsAuthenticated
from django.contrib.auth import get_user_model, authenticate
from marketplace.models import Project, Proposal, Contract
from django.db.models import Count, Q
from django.db import transaction

User = get_user_model()

@api_view(["GET"])
@permission_classes([AllowAny])
def health_check(request):
    return Response({"status": "ok"}, status=status.HTTP_200_OK)


class SignupView(APIView):
    
    def post(self, request):
        serializer = SignupSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        
        user = serializer.save()
        
        return Response({
            "id": str(user.id),
            "name": user.name,
            "email":user.email,
            "role": user.role
        }, status=status.HTTP_201_CREATED)
        

class LoginView(APIView):
    
    def post(self, request):
        serializer = LoginSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        
        email = serializer.validated_data["email"]
        password = serializer.validated_data["password"]
        
        user = authenticate(
            request,
            username=email,
            password=password
        )
        
        if user is None:
            return Response({
                "message":"Invalid email or password"
            }, status=status.HTTP_401_UNAUTHORIZED)
            
        refresh = RefreshToken.for_user(user=user)
        
        return Response({
            "access_token": str(refresh.access_token),
            "refresh_token": str(refresh),
            "user": {
                "id":str(user.id),
                "name":user.name,
                "role":user.role
            }
        }, status=status.HTTP_200_OK)
        
        
class ProjectView(APIView):
    permission_classes = [IsAuthenticated]
    
    def post(self, request):
        
        if request.user.role != User.Role.CLIENT:
            return Response({
                "message": "Only clients can create projects",
                
            }, status=status.HTTP_403_FORBIDDEN)
        
        serializer = ProjectCreateSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        
        project = serializer.save(client=request.user)
        
        return Response({
            "id": str(project.id),
            "message": "project created successfully."
        }, status=status.HTTP_201_CREATED)
        
        
    def get(self, request):
        projects = (
            Project.objects
            .filter(status=Project.Status.OPEN)
            .select_related("client")
            .annotate(proposal_count=Count("proposals"))
        )
        
        
        category = request.query_params.get("category")
        min_budget = request.query_params.get("minBudget")
        max_budget = request.query_params.get("maxBudget")

        if category:
            projects = projects.filter(
                category__iexact=category,
            )

        if min_budget:
            projects = projects.filter(
                budget_max__gte=min_budget,
            )

        if max_budget:
            projects = projects.filter(
                budget_min__lte=max_budget,
            )
        
        serializer = ProjectListSerializer(projects, many=True)
        
        return Response(serializer.data)
    
    
class ProposalView(APIView):
    permission_classes = [IsAuthenticated]
    
    def post(self, request, project_id):
        if request.user.role != User.Role.FREELANCER:
            return Response({
                "message": "Only freelancers can create proposals",
                
            }, status=status.HTTP_403_FORBIDDEN)  
        
        try:
            project = Project.objects.get(id=project_id)
        except Project.DoesNotExist:
            return Response({
                "message": "requested project not found."
            },status=status.HTTP_404_NOT_FOUND)
            
        if project.status != Project.Status.OPEN:
            return Response({
                "message": "Project is no longer accepting proposals."
            }, status=status.HTTP_403_FORBIDDEN)
        
        if Proposal.objects.filter(project=project, freelancer=request.user).exists():
            return Response({
                "message": "You have already submitted proposal for this project."
            }, status=status.HTTP_409_CONFLICT)
        
        serializer = ProposalCreateSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        
        proposal = serializer.save(project=project, freelancer=request.user)
        
        return Response({
            "message": "proposal submitted successfully.",
            "proposal": proposal.id
        }, status=status.HTTP_201_CREATED)

    def get(self, request, project_id):
        if request.user.role != User.Role.CLIENT:
            return Response({
                "message": "Only client can view proposals",
                
            }, status=status.HTTP_403_FORBIDDEN)  
        
        try:
            project = Project.objects.get(id=project_id)
        except Project.DoesNotExist:
            return Response({
                "message":"requested project not found.",
            }, status=status.HTTP_404_NOT_FOUND)
            
        if project.client != request.user:
            return Response({
                "message": "you don't own this project."
            }, status=status.HTTP_403_FORBIDDEN)
            
        
        proposals = (
            Proposal.objects
            .filter(project=project)
            .select_related("freelancer")
        )
        serializer = ProposalSerializer(proposals, many=True)
        
        return Response(serializer.data)

    # @method_decorator(transaction.atomic())
    # def put(self, request, project_id):
    #     if request.user.role != User.Role.CLIENT:
    #         return Response({
    #             "message": "Only client can view proposals",
                
    #         }, status=status.HTTP_403_FORBIDDEN)  
        
    #     try:
    #         project = Project.objects.get(id=project_id)
    #     except Project.DoesNotExist:
    #         return Response({
    #             "message":"requested project not found.",
    #         })
            
    #     if project.client != request.user:
    #         return Response({
    #             "message": "you don't own this project."
    #         }, status=status.HTTP_403_FORBIDDEN)
            
    #     proposals = (
    #         Proposal.objects
    #         .filter(project=project)
    #         .select_related("freelancer")
    #     )
        
        
        
    
            
        
class AcceptProposal(APIView):
    permission_classes = [IsAuthenticated]
    
    
    def put(self, request, proposal_id):
        if request.user.role != User.Role.CLIENT:
            return Response({
                "message": "Only client can accept proposals",
                
            }, status=status.HTTP_403_FORBIDDEN)  
            
        try:
            with transaction.atomic():
                proposal = (
                    Proposal.objects
                    .select_for_update()
                    .select_related("project", "freelancer")
                    .get(id=proposal_id)
                )
        
                project = proposal.project
                
                
                if project.client != request.user:
                    return Response({
                        "message": "you don't own this project."
                    }, status=status.HTTP_403_FORBIDDEN)
            
                if project.status != Project.Status.OPEN:
                    return Response({
                        "message": "project closed."
                    }, status=status.HTTP_403_FORBIDDEN)
            
                if proposal.status != Proposal.Status.PENDING:
                    return Response({
                        "message": "Proposal has already been processed."
                    }, status=status.HTTP_409_CONFLICT)
                    
                proposal.status = Proposal.Status.ACCEPTED
                proposal.save(update_fields=["status"])
                
                
                Proposal.objects.filter(
                    project=project
                ).exclude(
                    id=proposal.id
                ).update(
                    status=Proposal.Status.REJECTED
                )
                
                project.status = Project.Status.IN_PROGRESS
                project.save(update_fields=["status"])
                
                
                contract = Contract.objects.create(
                    project=project,
                    client=project.client,
                    freelancer=proposal.freelancer,
                    amount=proposal.proposed_price,
                    status=Contract.Status.ACTIVE,
                )
        
        except Proposal.DoesNotExist:
            return Response({
                "message":"Proposal not found."
            }, status=status.HTTP_404_NOT_FOUND)
            
            
        return Response({
            "message": "Proposal accepted successfully.",
            "proposal_id": str(proposal.id),
            "project_id": str(project.id),
            "contract_id": str(contract.id),
        })
        
        
class ProjectDetailView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request, project_id):
        try:
            project = (
                Project.objects
                .select_related("client")
                .annotate(proposal_count=Count("proposals"))
                .get(id=project_id)
            )
        except Project.DoesNotExist:
            return Response({
                "message": "Project not found.",
            }, status=status.HTTP_404_NOT_FOUND)

        if project.status != Project.Status.OPEN and project.client != request.user:
            has_proposal = Proposal.objects.filter(
                project=project,
                freelancer=request.user,
            ).exists()
            if not has_proposal:
                return Response({
                    "message": "You don't have access to this project.",
                }, status=status.HTTP_403_FORBIDDEN)

        serializer = ProjectListSerializer(project)

        return Response(serializer.data)


class MyProjectsView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        if request.user.role != User.Role.CLIENT:
            return Response({
                "message": "Only clients can view their projects.",
            }, status=status.HTTP_403_FORBIDDEN)

        projects = (
            Project.objects
            .filter(client=request.user)
            .select_related("client")
            .annotate(proposal_count=Count("proposals"))
        )

        serializer = ProjectListSerializer(projects, many=True)

        return Response(serializer.data)


class MyProposalsView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        if request.user.role != User.Role.FREELANCER:
            return Response({
                "message": "Only freelancers can view their proposals.",
            }, status=status.HTTP_403_FORBIDDEN)

        proposals = (
            Proposal.objects
            .filter(freelancer=request.user)
            .select_related("project")
        )

        serializer = MyProposalSerializer(proposals, many=True)

        return Response(serializer.data)


class ContractView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        contracts = (
            Contract.objects
            .filter(
                Q(client=request.user)
                | Q(freelancer=request.user)
            )
            .select_related(
                "project",
                "client",
                "freelancer",
            )
            .order_by("-created_at")
        )

        serializer = ContractSerializer(
            contracts,
            many=True,
        )

        return Response(
            serializer.data,
            status=status.HTTP_200_OK,
        )