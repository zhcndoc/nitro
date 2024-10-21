# GitLab Pages

> 将 Nitro 应用程序部署到 GitLab Pages。

**预设:** `gitlab_pages`

:read-more{title="GitLab Pages" to="https://pages.github.com/"}

## 设置

按照步骤 [创建一个 GitLab Pages 网站](https://docs.gitlab.com/ee/user/project/pages/#getting-started)。

## 部署

1. 这是一个示例 GitLab Pages 工作流，用于将您的网站部署到 GitLab Pages：

```yaml [.gitlab-ci.yml]
image: node:lts
before_script:
  - npx nypm install
pages:
  cache:
    paths:
      - node_modules/
  variables:
    NITRO_PRESET: gitlab_pages
  script:
    - npm run build
  artifacts:
    paths:
      - .output/public
  publish: .output/public
  rules:
    # 这确保只有对默认分支的推送
    # 才会触发页面部署
    - if: $CI_COMMIT_REF_NAME == $CI_DEFAULT_BRANCH
```
