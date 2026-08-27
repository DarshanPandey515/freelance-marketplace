from django.urls import path
from marketplace.views import *
from rest_framework_simplejwt.views import TokenRefreshView



urlpatterns = [
    path("health/", health_check, name="health"),
    
    path("auth/token/refresh/", TokenRefreshView.as_view(), name="token_refresh",),
    
    path("auth/signup/", SignupView.as_view(), name="signup",),
    path("auth/login/", LoginView.as_view(), name="login",),
    
    path("projects/", ProjectView.as_view(), name="projects",),
    path("projects/mine/", MyProjectsView.as_view(), name="my_projects",),
    path("projects/<uuid:project_id>/proposals/", ProposalView.as_view(), name="proposals",),
    path("projects/<uuid:project_id>/", ProjectDetailView.as_view(), name="project_detail",),

    path("proposals/mine/", MyProposalsView.as_view(), name="my_proposals",),
    path("proposals/<uuid:proposal_id>/accept/", AcceptProposal.as_view(), name="accept_proposal",),

    path("contracts/", ContractView.as_view(), name="contracts",),
        
]
