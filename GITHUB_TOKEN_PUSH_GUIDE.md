# GitHub 令牌配置与 Git 推送排错指南

> 适用场景：使用 GitHub Fine-grained Personal Access Token（细粒度个人访问令牌）或 GitHub CLI，将本地项目通过 HTTPS 推送到 GitHub 仓库。
>
> 本指南以仓库 `zhangduo568-cmyk/liyu` 和本地分支 `main` 为示例。请将示例中的仓库地址替换为你的实际仓库。

## 1. 先处理已经暴露的令牌

如果令牌曾经出现在聊天记录、终端输出、截图、日志、命令历史或远程 URL 中，应当把它视为已经泄露。不要继续使用，也不要只修改令牌名称。

请立即打开 GitHub 的 **Settings → Developer settings → Personal access tokens**，撤销原令牌，再创建一个新的 Fine-grained token。GitHub 将个人访问令牌视为密码，并且推荐优先使用 Fine-grained token，因为它可以限制资源所有者、具体仓库和权限范围。[1]

新令牌不应写入以下位置：

- Git 远程地址，例如 `https://TOKEN@github.com/owner/repo.git`；
- 项目的 `.env`、README、脚本或源码；
- shell 历史可见的命令参数；
- CI 日志、截图、Issue、Pull Request 评论或聊天记录。

如果令牌已经提交进 Git 历史，仅删除当前文件中的令牌是不够的。应先撤销令牌，然后再根据风险决定是否需要清理历史记录。

## 2. 创建 Fine-grained token

### 2.1 进入创建页面

1. 登录 GitHub。
2. 打开头像菜单，进入 **Settings**。
3. 进入 **Developer settings**。
4. 进入 **Personal access tokens → Fine-grained tokens**。
5. 点击 **Generate new token**。

GitHub 官方创建流程包含令牌名称、过期时间、资源所有者、仓库范围和具体权限等字段。[1]

### 2.2 推荐配置

对于只需要把本地项目推送到一个个人仓库的场景，推荐采用以下最小配置：

| 配置项 | 推荐值 | 说明 |
|---|---|---|
| Token name | `liyu-git-push-2026` | 使用可识别的用途名称 |
| Expiration | 7–30 天 | 临时推送不建议使用永久令牌 |
| Resource owner | `zhangduo568-cmyk` | 必须是仓库实际所属的用户或组织 |
| Repository access | `Only select repositories` | 只勾选 `liyu` |
| Repository permission: Contents | `Read and write` | Git push 的核心权限 |
| Repository permission: Metadata | `Read-only` | 通常会自动包含 |
| Workflows | 按需开启 | 如果推送内容包含 `.github/workflows/` 且 GitHub 明确要求该权限，再开启写入权限 |

令牌不能扩大账号本身的权限。即使令牌配置了写入权限，如果账号不是仓库协作者，或组织策略阻止访问，令牌仍然无法推送。[1]

Fine-grained token 如果面向组织资源，可能需要组织管理员审批。在审批完成前，令牌通常只能读取公开资源，不能用于写入组织仓库。[1]

### 2.3 创建后只复制一次

GitHub 通常只在生成后显示完整令牌。请立即把它放入密码管理器或系统密钥链，不要把它贴进聊天窗口。

建议使用以下命名方式记录：

```text
用途：liyu 仓库临时推送
仓库：zhangduo568-cmyk/liyu
权限：Contents read/write
创建日期：YYYY-MM-DD
过期日期：YYYY-MM-DD
```

## 3. 推送前的本地检查

进入项目目录后，先确认当前分支、工作区和远程地址：

```bash
cd /path/to/liyu

git status
git branch --show-current
git remote -v
git log --oneline -5
```

确认远程地址指向目标仓库：

```bash
git remote set-url origin https://github.com/zhangduo568-cmyk/liyu.git
```

如果项目已经有名为 `github` 的远程，也可以单独保留：

```bash
git remote add github https://github.com/zhangduo568-cmyk/liyu.git
# 已存在时使用：
# git remote set-url github https://github.com/zhangduo568-cmyk/liyu.git
```

推送前检查远程是否可读：

```bash
git ls-remote --heads github
```

如果目标仓库只有一个初始化 README，而本地项目是另一条 Git 历史，可以先合并两条历史：

```bash
git fetch github main:refs/remotes/github/main
git merge github/main --allow-unrelated-histories --no-edit
```

出现冲突时，先查看冲突文件：

```bash
git status
git diff --name-only --diff-filter=U
```

解决冲突后执行：

```bash
git add <已解决的文件>
git commit
```

不要在不确认远程内容的情况下直接使用 `git push --force`。强制推送可能覆盖其他人的提交，也可能删除远程历史。

## 4. 推荐方式：使用 GitHub CLI

GitHub CLI 是最推荐的 HTTPS 认证方式。GitHub 官方文档说明，使用 `gh auth login` 完成认证，并选择将 Git 凭据用于 HTTPS 后，通常可以直接使用 `git push` 和 `git pull`。[2]

### 4.1 安装并登录

```bash
gh auth login
```

交互选项建议如下：

```text
What account do you want to log into? GitHub.com
What is your preferred protocol for Git operations? HTTPS
Authenticate Git with your GitHub credentials? Yes
How would you like to authenticate GitHub CLI? Paste an authentication token
```

把新生成的令牌粘贴到交互式输入框中。不要把令牌直接写在命令行参数里。

### 4.2 检查当前账号

```bash
gh auth status
gh api user --jq '.login'
```

检查当前账号对目标仓库的权限：

```bash
gh api repos/zhangduo568-cmyk/liyu --jq '.permissions'
```

理想结果至少应包含：

```json
{
  "pull": true,
  "push": true
}
```

如果账号登录成功但 `push` 为 `false`，说明令牌本身或仓库访问范围不足。此时不要反复重试，应回到令牌的 Repository access 和 Contents 权限检查。

### 4.3 配置 Git 使用 GitHub CLI 凭据

```bash
gh auth setup-git
```

然后执行：

```bash
cd /path/to/liyu
git push github main:main
```

推送后验证远程分支：

```bash
git ls-remote --heads github main
```

## 5. 不使用 GitHub CLI 时的安全 HTTPS 方式

如果环境没有 GitHub CLI，可以使用 Git 的临时凭据助手。不要把令牌写入远程 URL，也不要把令牌作为 `git push` 参数。

### 5.1 Linux/macOS 临时 AskPass

创建临时文件 `/tmp/github-askpass.sh`：

```sh
#!/bin/sh
case "$1" in
  *Username*) echo "x-access-token" ;;
  *Password*) printf '%s' "$LIYU_GITHUB_TOKEN" ;;
  *) echo "" ;;
esac
```

限制文件权限：

```bash
chmod 700 /tmp/github-askpass.sh
```

在当前 shell 会话中设置令牌，不把令牌写入项目：

```bash
read -rsp 'GitHub token: ' LIYU_GITHUB_TOKEN
echo
export LIYU_GITHUB_TOKEN
```

执行推送：

```bash
GIT_ASKPASS=/tmp/github-askpass.sh \
GIT_TERMINAL_PROMPT=0 \
git -c credential.helper= push github main:main
```

推送完成后清理：

```bash
unset LIYU_GITHUB_TOKEN
rm -f /tmp/github-askpass.sh
```

该方式只适合临时操作。长期自动化建议使用 GitHub App、CI 的密钥管理或云平台 Secret，而不是长期个人令牌。GitHub 也指出，个人令牌主要代表个人访问；长期、组织级自动化更适合 GitHub App。[1]

## 6. 错误排查

### 6.1 `403 Permission to owner/repo denied`

这是最常见的推送失败。按以下顺序排查：

1. **确认认证账号**

   ```bash
   gh api user --jq '.login'
   gh auth status
   ```

   账号必须是仓库所有者、协作者，或属于具有写入权限的团队。

2. **确认仓库地址**

   ```bash
   git remote -v
   ```

   检查 owner、repo 拼写和大小写。

3. **确认仓库权限**

   ```bash
   gh api repos/OWNER/REPO --jq '.permissions'
   ```

   如果 `push` 为 `false`，检查仓库访问范围和 token 的 `Contents: Read and write`。

4. **确认令牌资源所有者**

   Fine-grained token 必须选择仓库实际所属的用户或组织。资源所有者选错时，即使仓库名称正确，也可能无法写入。

5. **确认组织审批与 SSO**

   如果仓库属于组织，检查 token 是否处于 pending 状态，以及组织是否要求 SAML SSO 授权。组织策略也可能禁止某类个人令牌。[1]

6. **清理旧凭据**

   Git 可能仍在使用系统密钥链中的旧账号。使用 GitHub CLI 时执行：

   ```bash
   gh auth setup-git
   ```

   如果仍然失败，检查系统凭据管理器中是否保存了错误的 GitHub 账号。

7. **确认不是 Deploy Key**

   GitHub 的“Permission to user/repo denied to user/other-repo”错误可能意味着当前 SSH key 被绑定成了另一个仓库的 Deploy Key。此时应移除错误的 Deploy Key，并把 SSH key 绑定到个人账号，或改用正确的个人认证方式。[4]

### 6.2 `401 Bad credentials`

通常表示令牌无效、已撤销、已过期，或令牌被复制时多了空格和换行。

处理步骤：

```bash
gh auth logout -h github.com
gh auth login
```

如果使用环境变量，先检查变量是否为空，但不要把令牌内容打印出来：

```bash
printf 'token_length='; printf '%s' "$LIYU_GITHUB_TOKEN" | wc -c
```

长度为 0 表示变量没有设置。长度正常也不代表权限正确，仍需检查 `gh api user` 和仓库权限。

### 6.3 `repository not found`

对私有仓库而言，这个错误既可能表示仓库地址错误，也可能表示当前账号没有访问权限。不要只根据网页是否能打开来判断 Git 写权限。

执行：

```bash
gh repo view OWNER/REPO
```

如果无法查看，检查仓库是否存在、账号是否被邀请、token 是否包含该仓库，以及组织是否要求审批。

### 6.4 `non-fast-forward`

这表示远程分支有本地没有的提交。先获取并检查差异：

```bash
git fetch github main
git log --oneline --graph --decorate --all -20
git diff HEAD..github/main
```

如果远程提交应当保留：

```bash
git merge github/main
# 解决冲突后
git push github main:main
```

只有在确认远程提交可以被替换时，才考虑：

```bash
git push --force-with-lease github main:main
```

优先使用 `--force-with-lease`，不要使用无保护的 `--force`。

### 6.5 `.github/workflows` 推送被拒绝

如果推送内容包含 GitHub Actions 工作流，GitHub 可能要求额外的 Workflows 权限或更高的组织审批。先阅读错误返回的具体权限名称，再只增加对应的最小权限。不要为了绕过单个文件的拒绝而授予全部组织权限。

## 7. 本项目的推荐推送流程

以下命令适用于本项目已经在本地完成提交，并且目标仓库地址为：

```text
https://github.com/zhangduo568-cmyk/liyu.git
```

### 7.1 检查本地状态

```bash
cd /home/ubuntu/liyu-gift-prototype
git status
git branch --show-current
git log --oneline -5
```

### 7.2 配置远程

```bash
git remote add github https://github.com/zhangduo568-cmyk/liyu.git
```

如果提示 remote 已存在：

```bash
git remote set-url github https://github.com/zhangduo568-cmyk/liyu.git
```

### 7.3 检查目标仓库

```bash
git ls-remote --heads github
gh api repos/zhangduo568-cmyk/liyu --jq '.permissions'
```

### 7.4 合并初始化 README

只有在远程仓库已经存在 README 等提交，而本地历史不同的时候执行：

```bash
git fetch github main:refs/remotes/github/main
git merge github/main --allow-unrelated-histories --no-edit
```

### 7.5 通过 GitHub CLI 推送

```bash
gh auth setup-git
git push github main:main
```

### 7.6 验证推送

```bash
git ls-remote --heads github main
git status
```

远程 `main` 的 commit hash 应与本地 `git rev-parse HEAD` 一致：

```bash
git rev-parse HEAD
git ls-remote github refs/heads/main | cut -f1
```

如果两个 hash 一致，说明远程分支已经指向本地提交。

## 8. 最小安全清单

推送完成后，建议逐项确认：

- 令牌只授予目标仓库的 `Contents: Read and write`；
- 令牌设置了过期日期；
- 令牌没有出现在 remote URL、源码、`.env` 或日志中；
- 临时 askpass 文件已经删除；
- 没有把令牌写入 Git commit；
- 不再使用的令牌已经撤销；
- 若仓库属于组织，已完成组织审批或 SSO 授权；
- 远程分支 hash 与本地目标提交一致；
- `.gitignore` 已排除 `.env`、密钥文件、构建缓存和本地凭据。

## References

[1]: https://docs.github.com/en/authentication/keeping-your-account-and-data-secure/managing-your-personal-access-tokens "Managing your personal access tokens"

[2]: https://docs.github.com/en/github-cli/github-cli/quickstart "GitHub CLI quickstart"

[3]: https://docs.github.com/rest/authentication/permissions-required-for-fine-grained-personal-access-tokens "Permissions required for fine-grained personal access tokens"

[4]: https://docs.github.com/en/authentication/troubleshooting-ssh/error-permission-to-userrepo-denied-to-userother-repo "Error: Permission to user/repo denied to user/other-repo"
