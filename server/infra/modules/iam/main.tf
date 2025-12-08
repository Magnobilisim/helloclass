resource "aws_iam_role" "github_actions" {
  name               = "${var.project_name}-${var.environment}-github"
  assume_role_policy = var.assume_role_policy
}

data "aws_iam_policy_document" "combined" {
  statement {
    sid       = "TerraformAccess"
    effect    = "Allow"
    actions   = var.allowed_actions
    resources = ["*"]
  }
}

resource "aws_iam_policy" "github_permissions" {
  name   = "${var.project_name}-${var.environment}-github-policy"
  policy = data.aws_iam_policy_document.combined.json
}

resource "aws_iam_role_policy_attachment" "github_attach" {
  role       = aws_iam_role.github_actions.name
  policy_arn = aws_iam_policy.github_permissions.arn
}
