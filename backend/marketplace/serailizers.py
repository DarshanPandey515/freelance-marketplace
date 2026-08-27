from datetime import date
from rest_framework import serializers
from marketplace.models import Contract, Project, Proposal, User


class SignupSerializer(serializers.ModelSerializer):
    """Validate user registration."""

    password = serializers.CharField(
        write_only=True,
        min_length=8,
    )

    class Meta:
        model = User
        fields = [
            "id",
            "name",
            "email",
            "password",
            "role",
        ]
        read_only_fields = ["id"]

    def validate_email(self, value: str) -> str:
        return value.lower().strip()

    def create(self, validated_data: dict) -> User:
        password = validated_data.pop("password")

        user = User.objects.create_user(
            password=password,
            **validated_data,
        )

        return user


class LoginSerializer(serializers.Serializer):
    """Validate login credentials."""

    email = serializers.EmailField()
    password = serializers.CharField(
        write_only=True,
    )


class ProjectCreateSerializer(serializers.ModelSerializer):
    """Validate project creation."""

    class Meta:
        model = Project
        fields = [
            "id",
            "title",
            "description",
            "category",
            "budget_min",
            "budget_max",
            "deadline",
        ]
        read_only_fields = ["id"]

    def validate_deadline(self, value: date) -> date:
        if value <= date.today():
            raise serializers.ValidationError(
                "Deadline must be in the future."
            )

        return value

    def validate(self, attrs: dict) -> dict:
        budget_min = attrs["budget_min"]
        budget_max = attrs["budget_max"]

        if budget_max < budget_min:
            raise serializers.ValidationError(
                {
                    "budget_max": (
                        "Budget maximum must be greater than "
                        "or equal to budget minimum."
                    )
                }
            )

        return attrs


class ProjectListSerializer(serializers.ModelSerializer):
    """Serialize projects for browsing."""

    client_id = serializers.UUIDField(
        source="client.id",
        read_only=True,
    )

    client_name = serializers.CharField(
        source="client.name",
        read_only=True,
    )

    proposal_count = serializers.IntegerField(
        read_only=True,
    )

    class Meta:
        model = Project
        fields = [
            "id",
            "title",
            "description",
            "category",
            "budget_min",
            "budget_max",
            "deadline",
            "status",
            "client_id",
            "client_name",
            "proposal_count",
        ]


class ProposalCreateSerializer(serializers.ModelSerializer):
    """Validate proposal submission."""

    class Meta:
        model = Proposal
        fields = [
            "cover_letter",
            "proposed_price",
            "estimated_duration",
        ]

    def validate_estimated_duration(self, value: int) -> int:
        if value <= 0:
            raise serializers.ValidationError(
                "Estimated duration must be greater than zero."
            )

        return value


class ProposalSerializer(serializers.ModelSerializer):
    """Serialize proposals."""

    proposal_id = serializers.UUIDField(
        source="id",
        read_only=True,
    )

    freelancer_id = serializers.UUIDField(
        source="freelancer.id",
        read_only=True,
    )

    freelancer_name = serializers.CharField(
        source="freelancer.name",
        read_only=True,
    )

    class Meta:
        model = Proposal
        fields = [
            "proposal_id",
            "freelancer_id",
            "freelancer_name",
            "cover_letter",
            "proposed_price",
            "estimated_duration",
            "status",
            "created_at",
        ]


class MyProposalSerializer(serializers.ModelSerializer):
    """Serialize a freelancer's own proposals with project info."""

    proposal_id = serializers.UUIDField(
        source="id",
        read_only=True,
    )

    project_id = serializers.UUIDField(
        source="project.id",
        read_only=True,
    )

    project_title = serializers.CharField(
        source="project.title",
        read_only=True,
    )

    project_status = serializers.CharField(
        source="project.status",
        read_only=True,
    )

    class Meta:
        model = Proposal
        fields = [
            "proposal_id",
            "project_id",
            "project_title",
            "project_status",
            "cover_letter",
            "proposed_price",
            "estimated_duration",
            "status",
            "created_at",
        ]


class ContractSerializer(serializers.ModelSerializer):
    """Serialize contracts."""

    project = serializers.CharField(
        source="project.title",
        read_only=True,
    )

    client = serializers.CharField(
        source="client.name",
        read_only=True,
    )

    freelancer = serializers.CharField(
        source="freelancer.name",
        read_only=True,
    )

    class Meta:
        model = Contract
        fields = [
            "id",
            "project",
            "client",
            "freelancer",
            "amount",
            "status",
            "created_at",
        ]