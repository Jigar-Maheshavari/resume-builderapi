'use strict'
const config = require('config')
const wreck = require('@hapi/wreck')
const helper = require('@utilities/helper')

// const errorHelper = require('@utilities/error-helper')
// const { errors } = require('@utilities/constants')
// const node_ssh = require('node-ssh')
// const ssh = new node_ssh()
// let serverAuth = {}

exports.plugin = {
  async register(server, options) {
    // serverAuth = options
    wreck.defaults({
      headers: {
        'Content-Type': 'application/json'
      }
    })
  },

  async getSourceCode(userName, repo, path, branch) {
    const options = {
      headers: {
        Accept: `application/vnd.github.v3+json`,
        Authorization: `token ${config.constants.GITHUB_ORG_TOKEN}`,
        'User-Agent': 'request'
      }
    }
    const promise = wreck.request(
      'GET',
      `${config.constants.GIT_ENDPOINT}/repos/${userName}/${repo}/contents/${path}?ref=${branch}`,
      options
    )
    try {
      const res = await promise
      const body = await wreck.read(res, {
        json: true
      })
      return body
    } catch (err) {
      return err.output
    }
  },

  async addGithubSshKey(userId, title, key) {
    const options = {
      headers: {
        Accept: `application/vnd.github.v3+json`,
        Authorization: `token ${config.constants.GITHUB_ORG_TOKEN}`,
        'User-Agent': 'request'
      },
      payload: {
        title: `[VIRTUOUS-CLOUD][${config.modelS3Prefix}][${userId}]-${title}`,
        key
      }
    }
    const promise = wreck.request(
      'POST',
      `${config.constants.GIT_ENDPOINT}/user/keys`,
      options
    )
    try {
      const res = await promise
      const body = await wreck.read(res, {
        json: true
      })
      return body
    } catch (err) {
      return err.output
    }
  },
  async removeGithubSshKey(keyId) {
    const options = {
      headers: {
        Accept: `application/vnd.github.v3+json`,
        Authorization: `token ${config.constants.GITHUB_ORG_TOKEN}`,
        'User-Agent': 'request'
      }
    }
    const promise = wreck.request(
      'DELETE',
      `${config.constants.GIT_ENDPOINT}/user/keys/${keyId}`,
      options
    )
    try {
      const res = await promise
      const body = await wreck.read(res, {
        json: true
      })
      return body
    } catch (err) {
      return err.output
    }
  },

  async authenticateGithub(code) {
    const options = {
      headers: {
        Accept: `application/vnd.github.v3+json`
      }
    }
    const url = `${config.constants.GITHUB_ACCESS_TOKEN_BASEURL}?client_id=${config.constants.GITHUB_CLIENT_ID}&client_secret=${config.constants.GITHUB_CLIENT_SECRET}&code=${code}`
    const promise = wreck.request('POST', url, options)
    try {
      const res = await promise
      const body = await wreck.read(res, {
        json: true
      })
      return body
    } catch (err) {
      return err.output
    }
  },

  async checkValidGithubUser(githubUserName) {
    const options = {
      headers: {
        Accept: `application/vnd.github.v3+json`,
        'User-Agent': 'request'
      }
    }
    const url = `${config.constants.GIT_ENDPOINT}/users/${githubUserName}`
    const promise = wreck.request('GET', url, options)
    try {
      const res = await promise
      const body = await wreck.read(res, {
        json: true
      })
      return body
    } catch (err) {
      return err.output
    }
  },

  async checkOwnerRepoAccepted(collaborator, repo) {
    const options = {
      headers: {
        Accept: `application/vnd.github.v3+json`,
        Authorization: `token ${config.constants.GITHUB_ORG_TOKEN}`,
        'User-Agent': 'request'
      }
    }
    const url = `${config.constants.GIT_ENDPOINT}/repos/${config.constants.GITHUB_ORG_USERNAME}/${repo}/collaborators/${collaborator}`
    const promise = wreck.request('GET', url, options)
    try {
      const res = await promise
      return res.statusCode
    } catch (err) {
      return err.output
    }
  },

  async getGithubUser() {
    const options = {
      headers: {
        Accept: `application/vnd.github.v3+json`,
        Authorization: `token ${config.constants.GITHUB_ORG_TOKEN}`,
        'User-Agent': 'request'
      }
    }
    const promise = wreck.request(
      'GET',
      `${config.constants.GIT_ENDPOINT}/user`,
      options
    )
    try {
      const res = await promise
      const body = await wreck.read(res, {
        json: true
      })
      return body
    } catch (err) {
      return err.output
    }
  },

  async getGithubRepoList() {
    const options = {
      headers: {
        Accept: `application/vnd.github.v3+json`,
        Authorization: `token ${config.constants.GITHUB_ORG_TOKEN}`,
        'User-Agent': 'request'
      }
    }
    const promise = wreck.request(
      'GET',
      `${config.constants.GIT_ENDPOINT}/user/repos`,
      options
    )
    try {
      const res = await promise
      const body = await wreck.read(res, {
        json: true
      })
      return body
    } catch (err) {
      return err.output
    }
  },

  async createGitUser(username, password, email, fullname) {
    const options = {
      payload: {
        email: email,
        full_name: fullname,
        login_name: username,
        must_change_password: false,
        password: password,
        username: username
      },
      headers: {
        Authorization: config.constants.GIT_EA_KEY
      }
    }

    const promise = wreck.request(
      'POST',
      `${config.constants.GIT_ENDPOINT}/admin/users`,
      options
    )
    try {
      const res = await promise
      const body = await wreck.read(res, {
        json: true
      })
      return body
    } catch (err) {
      return err.output
    }
  },

  async getGitUser(username) {
    const options = {
      headers: {
        Authorization: config.constants.GIT_EA_KEY
      }
    }
    const promise = wreck.request(
      'GET',
      `${config.constants.GIT_ENDPOINT}/users/${username}`,
      options
    )
    try {
      const res = await promise
      const body = await wreck.read(res, {
        json: true
      })
      return body
    } catch (err) {
      return err.output
    }
  },

  async getGitUserRepositories(username) {
    const options = {
      headers: {
        Authorization: config.constants.GIT_EA_KEY
      }
    }
    const promise = wreck.request(
      'GET',
      `${config.constants.GIT_ENDPOINT}/users/${username}/repos`,
      options
    )
    try {
      const res = await promise
      const body = await wreck.read(res, {
        json: true
      })
      return body
    } catch (err) {
      return err.output
    }
  },

  async archiveRepository(username, repository, payload) {
    const option = {
      payload: payload,
      headers: {
        Authorization: config.constants.GIT_EA_KEY
      }
    }
    const promise = wreck.request(
      'PATCH',
      `${config.constants.GIT_ENDPOINT}/repos/${username}/${repository}`,
      option
    )
    try {
      const res = await promise
      const body = await wreck.read(res, {
        json: true
      })
      return body
    } catch (err) {
      return err.output
    }
  },

  async getAllGitUser() {
    const options = {
      headers: {
        Authorization: config.constants.GIT_EA_KEY
      }
    }
    const promise = wreck.request(
      'GET',
      `${config.constants.GIT_ENDPOINT}/admin/users`,
      options
    )
    try {
      const res = await promise
      const body = await wreck.read(res, {
        json: true
      })
      return body
    } catch (err) {
      return err.output
    }
  },

  async addDeleteCollaboratorToRepo(repo, owner, collaborator, isAdd) {
    const options = {
      headers: {
        Accept: `application/vnd.github.v3+json`,
        Authorization: `token ${config.constants.GITHUB_ORG_TOKEN}`,
        'User-Agent': 'request'
      }
    }
    const promise = wreck.request(
      isAdd ? 'PUT' : 'DELETE',
      `${config.constants.GIT_ENDPOINT}/repos/${owner}/${repo}/collaborators/${collaborator}`,
      options
    )
    try {
      const res = await promise
      const body = await wreck.read(res, {
        json: true
      })
      return body
    } catch (err) {
      return err.output
    }
  },

  // async acceptInviteCollaborator(inviteId, token) {
  //   const options = {
  //     headers: {
  //       Accept: `application/vnd.github.v3+json`,
  //       Authorization: `token ${token}`,
  //       'User-Agent': 'request'
  //     }
  //   }
  //   const promise = wreck.request(
  //     'PATCH',
  //     `${config.constants.GIT_ENDPOINT}/user/repository_invitations/${inviteId}`,
  //     options
  //   )
  //   try {
  //     const res = await promise
  //     const body = await wreck.read(res, {
  //       json: true
  //     })
  //     return body
  //   } catch (err) {
  //     return err.output
  //   }
  // },

  async transferRepo(repo, owner, payload) {
    const options = {
      headers: {
        Authorization: config.constants.GIT_EA_KEY,
        'Content-Type': 'application/json'
      },
      payload
    }
    const promise = wreck.request(
      'POST',
      `${config.constants.GIT_ENDPOINT}/repos/${owner}/${repo}/transfer`,
      options
    )
    try {
      const res = await promise
      const body = await wreck.read(res, {
        json: true
      })
      return body
    } catch (err) {
      return err.output
    }
  },

  async deleteGitUser(username) {
    const options = {
      headers: {
        Authorization: config.constants.GIT_EA_KEY
      }
    }
    const promise = wreck.request(
      'DELETE',
      `${config.constants.GIT_ENDPOINT}/admin/users/${username}`,
      options
    )
    try {
      const res = await promise
      const body = await wreck.read(res, {
        json: true
      })
      return body
    } catch (err) {
      return err.output
    }
  },

  async deleteGitRepo(username, repo) {
    const options = {
      headers: {
        Accept: `application/vnd.github.v3+json`,
        Authorization: `token ${config.constants.GITHUB_ORG_TOKEN}`,
        'User-Agent': 'request'
      }
    }
    const promise = wreck.request(
      'DELETE',
      `${config.constants.GIT_ENDPOINT}/repos/${username}/${repo}`,
      options
    )
    try {
      const res = await promise
      const body = await wreck.read(res, {
        json: true
      })
      return body
    } catch (err) {
      return err.output
    }
  },

  async changeGitPassword(username, email, password) {
    const option = {
      payload: {
        password,
        email
      },
      headers: {
        Authorization: config.constants.GIT_EA_KEY
      }
    }
    const promise = wreck.request(
      'PATCH',
      `${config.constants.GIT_ENDPOINT}/admin/users/${username}`,
      option
    )
    try {
      const res = await promise
      const body = await wreck.read(res, {
        json: true
      })
      return body
    } catch (err) {
      return err.output
    }
  },

  async updateGitUser(username, payload) {
    const option = {
      payload,
      headers: {
        Authorization: config.constants.GIT_EA_KEY
      }
    }
    const promise = wreck.request(
      'PATCH',
      `${config.constants.GIT_ENDPOINT}/admin/users/${username}`,
      option
    )
    try {
      const res = await promise
      const body = await wreck.read(res, {
        json: true
      })
      return body
    } catch (err) {
      return err.output
    }
  },

  async addSsh(username, pubSsh, label) {
    const options = {
      payload: {
        key: pubSsh,
        title: label
      },
      headers: {
        Authorization: config.constants.GIT_EA_KEY
      }
    }

    const promise = wreck.request(
      'POST',
      `${config.constants.GIT_ENDPOINT}/admin/users/${username}/keys`,
      options
    )

    try {
      const res = await promise
      const body = await wreck.read(res, {
        json: true
      })
      console.log('body')
      console.log(body)
      return body
    } catch (err) {
      return err.output
    }
  },

  async editSsh(username, pubSshId, pubSsh, label) {
    const option = {
      headers: {
        Authorization: config.constants.GIT_EA_KEY
      }
    }

    await wreck.request(
      'DELETE',
      `${config.constants.GIT_ENDPOINT}/admin/users/${username}/keys/${pubSshId}`,
      option
    )

    const addOptions = {
      payload: {
        key: pubSsh,
        title: label
      },
      headers: {
        Authorization: config.constants.GIT_EA_KEY
      }
    }

    const promise = wreck.request(
      'POST',
      `${config.constants.GIT_ENDPOINT}/admin/users/${username}/keys`,
      addOptions
    )

    try {
      const res = await promise
      const body = await wreck.read(res, {
        json: true
      })
      return body
    } catch (err) {
      return err.output
    }
  },

  async removeSsh(username, pubSshId) {
    const option = {
      headers: {
        Authorization: config.constants.GIT_EA_KEY
      }
    }

    const promise = wreck.request(
      'DELETE',
      `${config.constants.GIT_ENDPOINT}/admin/users/${username}/keys/${pubSshId}`,
      option
    )

    try {
      const res = await promise
      const body = await wreck.read(res, {
        json: true
      })
      console.log('body')
      console.log(body)
      return body
    } catch (err) {
      return err.output
    }
  },

  async createGitRepo(username, reponame, data) {
    const options = {
      payload: {
        description: data.description,
        auto_init: !!data.isReadme,
        name: reponame,
        private: data.isPrivate
      },
      headers: {
        Accept: `application/vnd.github.v3+json`,
        Authorization: `token ${config.constants.GITHUB_ORG_TOKEN}`,
        'User-Agent': 'request'
      }
    }
    const promise = wreck.request(
      'POST',
      `${config.constants.GIT_ENDPOINT}/user/repos`,
      options
    )
    try {
      const res = await promise
      const body = await wreck.read(res, {
        json: true
      })
      return body
    } catch (err) {
      return err.output
    }
  },

  async getCommits(userName, repo, branch) {
    const options = {
      headers: {
        Accept: `application/vnd.github.v3+json`,
        Authorization: `token ${config.constants.GITHUB_ORG_TOKEN}`,
        'User-Agent': 'request'
      }
    }
    const promise = wreck.request(
      'GET',
      `${config.constants.GIT_ENDPOINT}/repos/${userName}/${repo}/commits?sha=${branch}`,
      options
    )
    try {
      const res = await promise
      const body = await wreck.read(res, {
        json: true
      })
      return body
    } catch (err) {
      return err.output
    }
  },

  async getAllBranches(username, repository) {
    const options = {
      headers: {
        Accept: `application/vnd.github.v3+json`,
        Authorization: `token ${config.constants.GITHUB_ORG_TOKEN}`,
        'User-Agent': 'request'
      }
    }
    const promise = wreck.request(
      'GET',
      `${config.constants.GIT_ENDPOINT}/repos/${username}/${repository}/branches`,
      options
    )
    try {
      const res = await promise
      const body = await wreck.read(res, {
        json: true
      })
      return body
    } catch (err) {
      return err.output
    }
  },

  async getSingleGithubRepo(owner, repo) {
    const options = {
      headers: {
        Accept: `application/vnd.github.v3+json`,
        Authorization: `token ${config.constants.GITHUB_ORG_TOKEN}`,
        'User-Agent': 'request'
      }
    }
    const promise = wreck.request(
      'GET',
      `${config.constants.GIT_ENDPOINT}/repos/${owner}/${repo}`,
      options
    )
    try {
      const res = await promise
      const body = await wreck.read(res, {
        json: true
      })
      return body
    } catch (err) {
      return err.output
    }
  },

  async getCommitDetail(userName, repo, sha) {
    const option = {
      headers: {
        Authorization: config.constants.GIT_EA_KEY
      }
    }
    const promise = wreck.request(
      'GET',
      // `${config.constants.GIT_ENDPOINT}/repos/${userName}/${repo}/git/blobs/${sha}`,
      // `${config.constants.GIT_ENDPOINT}/repos/${userName}/${repo}/contents?ref=${sha}`,
      `${config.constants.GIT_ENDPOINT}/repos/${userName}/${repo}/git/commits/${sha}`,
      // `https://gitea.com/gitea/helm-chart/commit/${sha}.diff`,
      // `${config.constants.GIT_ENDPOINT}/${userName}/${repo}/commit/${sha}.diff`,
      // `${config.constants.GIT_ENDPOINT}/repos/${userName}/${repo}/git/commits/${sha}`,
      // `${config.constants.GIT_ENDPOINT}/repos/${userName}/${repo}/pulls/${7}.diff`,
      // `https://gitea.com/${userName}/${repo}/commit/${sha}.diff`,
      // https://gitea.com/<owner>/<project>/commit/<SHA-256>.diff
      // /repos/{owner}/{repo}/commits/{ref}/statuses
      option
    )
    try {
      const res = await promise
      const body = await wreck.read(res, {
        json: true
      })
      console.log('body: ', body)
      // console.log('body: ', String.fromCharCode.apply(null, new Uint16Array(body)))
      return body
    } catch (err) {
      return err.output
    }
  },

  async fileAddUpdate(
    branch,
    path,
    content,
    owner,
    userName,
    email,
    repo,
    message,
    sha
  ) {
    const option = {
      payload: {
        author: {
          email,
          name: userName
        },
        branch: branch,
        committer: {
          email,
          name: userName
        },
        content: helper.encodeBase64(content),
        dates: {
          author: new Date(),
          committer: new Date()
        },
        message,
        sha
      },
      headers: {
        Accept: `application/vnd.github.v3+json`,
        Authorization: `token ${config.constants.GITHUB_ORG_TOKEN}`,
        'User-Agent': 'request'
      }
    }
    const promise = wreck.request(
      'PUT',
      `${config.constants.GIT_ENDPOINT}/repos/${owner}/${repo}/contents/${path}`,
      option
    )
    try {
      const res = await promise
      const body = await wreck.read(res, {
        json: true
      })
      return body
    } catch (err) {
      return err.output
    }
  },

  async fileDelete(branch, path, owner, userName, email, repo, message, sha) {
    const option = {
      payload: {
        author: {
          email,
          name: userName
        },
        branch: branch,
        committer: {
          email,
          name: userName
        },
        dates: {
          author: new Date(),
          committer: new Date()
        },
        message,
        sha
      },
      headers: {
        Accept: `application/vnd.github.v3+json`,
        Authorization: `token ${config.constants.GITHUB_ORG_TOKEN}`,
        'User-Agent': 'request'
      }
    }
    const promise = wreck.request(
      'DELETE',
      `${config.constants.GIT_ENDPOINT}/repos/${owner}/${repo}/contents/${path}`,
      option
    )
    try {
      const res = await promise
      const body = await wreck.read(res, {
        json: true
      })
      return body
    } catch (err) {
      return err.output
    }
  },

  async downloadRepo(branch, owner, repo) {
    const option = {
      headers: {
        Authorization: config.constants.GIT_EA_KEY
      }
    }
    const promise = wreck.request(
      'GET',
      `${config.constants.GIT_ENDPOINT}/repos/${owner}/${repo}/archive/${branch}.zip`,
      option
    )
    try {
      const res = await promise
      const body = await wreck.read(res, {
        json: true
      })
      return body
    } catch (err) {
      return err.output
    }
  },

  // async fileRemove(
  //   path,
  //   branch,
  //   fileName,
  //   content,
  //   commitMessage,
  //   commiterName,
  //   commiterEmail
  // ) {
  //   const option = {
  //     payload: {
  //       path: path,
  //       branch: branch,
  //       file: fileName,
  //       content: content,
  //       commiteMessage: commitMessage,
  //       commiterName: commiterName,
  //       commiterEmail: commiterEmail
  //     }
  //   }
  //   const promise = wreck.request(
  //     'POST',
  //     `${config.constants.GIT_ENDPOINT}/git/removeFile`,
  //     option
  //   )
  //   try {
  //     const res = await promise
  //     const body = await wreck.read(res, {
  //       json: true
  //     })
  //     return body
  //   } catch (err) {
  //     return err.output
  //   }
  // },

  name: 'git',
  version: require('../../package.json').version
}
