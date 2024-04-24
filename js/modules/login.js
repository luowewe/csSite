import files from './files';
import github from './github';
import { $, $$, a, icon, text } from './dom';
import { jsonIfOk } from './fetch-helpers';

const KEY = 'anonymousUntil';
const TTL = 15 * 60 * 1000; // fifteen minutes in milliseconds.

class Login {
  constructor(siteMetadata) {
    this.siteMetadata = siteMetadata;
    this.username = null;
    this.profileURL = null;
    this.isMember = false;
    this.pending = true;
    this.problemMakingRepo = null;
    this.createdRepo = false;
    this.repoURL = null;
    this.storage = null;
  }

  logIn(username, profileURL) {
    this.username = username;
    this.profileURL = profileURL;
  }

  /* eslint-disable class-methods-use-this */
  get anonymous() {
    const v = sessionStorage.getItem(KEY);
    if (v === null) {
      return false;
    } else {
      const expiresAt = Number.parseInt(v, 10);
      if (expiresAt < Date.now()) {
        sessionStorage.removeItem(KEY);
        return false;
      } else {
        sessionStorage.setItem(KEY, String(Date.now() + TTL));
        return true;
      }
    }
  }

  set anonymous(value) {
    if (value) {
      sessionStorage.setItem(KEY, String(Date.now() + TTL));
    } else {
      sessionStorage.removeItem(KEY);
    }
  }
  /* eslint-enable */

  goAnonymous() {
    this.anonymous = true;
    this.showLoginFlow();
  }

  get isLoggedIn() {
    return this.username !== null;
  }

  get ok() {
    return this.isLoggedIn && this.isMember && !this.pending && this.problemMakingRepo === null;
  }

  setupToolbar(onAttachToGithub) {
    const toolbarButtons = document.querySelector('#toolbar .buttons');

    // This is the login button in the top toolbar.
    const loginButton = toolbarButtons.querySelector('.github');
    if (loginButton) {
      loginButton.onclick = () => this.attachToGithub(onAttachToGithub);
    }

    const infoToggler = icon('info-circle');
    infoToggler.onclick = toggleInfo;
    toolbarButtons.append(infoToggler);

    // This is the login button in the login flow.
    $('#login').onclick = () => this.attachToGithub(onAttachToGithub);
    if ($('#anonymous')) {
      $('#anonymous').onclick = () => this.goAnonymous();
    }
    $('#login-flow svg.x').onclick = hideInfo;
  }

  async attachToGithub(onAttachToGithub) {
    if (this.isLoggedIn) return;

    this.storage.repo = await this.connectToGithub();

    if (onAttachToGithub) {
      onAttachToGithub();
    }
  }


  // Connecting to Github is somewhat involved in that we need to first
  // sucessfully log in to github via OAuth, which is handled by Netlify. Then
  // we need to check that the authenticated user is a member of the appropriate
  // Github organization. And if they are a member, they could still be only a
  // pending member if they've bene invited but have not yet accepted the
  // invitation.
  //
  // Only if the user can authenticate, is a member of the org, and has accepted
  // their invitation can we actually get their repo. And even there there are
  // two possibilities: if the repo has already been created, great. Otherwise
  // we have to create the repo. Which could fail. This method handles all those
  // cases, returning a repo if it can and otherwise showing the login flow
  // which will use the state of this object to determine exactly what message
  // to display.

  async connectToGithub() {
    $('#login-flow').hidden = true;

    // This is the Netlify site id for this website which I think is used to do
    // the OAuth dance. Presumably it needs to change if this is being served up
    // from a different site.

    // This is the original intro.gigamonkeys.com site
    //const siteId = '6183282f-af29-4a93-a442-6c5bfb43a44f';

    // This is the demo.gigamonkeys.com site
    const siteId = 'f01cbdd1-44bf-4726-8962-d066dcdb0202';

    const gh = await github.connect(siteId);

    this.logIn(gh.user.login, gh.user.html_url);

    let repo = null;

    const { githubOrganization, templateRepo } = this.siteMetadata;
    const member = await gh.membership(githubOrganization);

    if (member) {
      this.isMember = true;
      this.pending = member.state === 'pending';

      if (!this.pending) {
        try {
          const repoName = new URLSearchParams(window.location.search).get('repo') || this.username;
          repo = await gh.orgRepos(githubOrganization).getRepo(repoName);
        } catch (e) {
          try {
            repo = await gh
              .orgRepos(githubOrganization)
              .makeRepoFromTemplate(this.username, githubOrganization, templateRepo);

            // Record that we created the repo so we can show information in the
            // login flow about it this one time.
            this.createdRepo = true;
          } catch (e) {
            console.log(e); // So I can debug if student runs into this.
            this.problemMakingRepo = e;
            repo = null;
          }
        }
      }
    }

    if (repo !== null) {
      if (await repo.tryToProtectMain()) {
        console.log('Protected main');
      } else {
        console.log("Couldn't protect main. Will try again later.");
      }
      this.repoURL = repo.url;
    }

    this.showLoggedIn();

    if (repo === null || this.createdRepo || this.pending) {
      this.showLoginFlow();
    }

    return repo;
  }

  // This method encapsulates the logic about the messages to display to the
  // user in all the different stages of getting connected to github, getting
  // added to the organization, and having their repo created.

  showLoginFlow() {
    const b = $('#login-flow');

    if (this.anonymous || (this.ok && !this.createdRepo)) {
      b.hidden = true;
    } else {
      // Hide everything ...
      $$('#login-flow > div').forEach((e) => {
        e.hidden = true;
      });
      b.querySelector('.x').style.display = 'none';

      // ... and then show the right thing.
      if (!this.isLoggedIn) {
        b.querySelector('.logged-out').hidden = false;
      } else if (!this.isMember) {
        $('#login-flow .profile-url > span').replaceChildren(a(this.profileURL));
        $('#login-flow .profile-url > svg').onclick = () => {
          navigator.clipboard.writeText(this.profileURL);
        };
        b.querySelector('.not-a-member').hidden = false;
      } else if (this.isMember && this.pending) {
        b.querySelector('.pending-member').hidden = false;
      } else if (this.problemMakingRepo) {
        b.querySelector('.x').style.display = 'inline';
        b.querySelector('.problem-with-repo').hidden = false;
      } else if (this.createdRepo) {
        b.querySelector('.x').style.display = 'inline';
        const div = b.querySelector('.created-repo');
        div.querySelector('span').replaceChildren(a(this.repoURL));
        div.hidden = false;
      }
      b.hidden = false;
    }
  }

  showLoggedIn() {
    const button = document.querySelector('#toolbar .buttons .github');
    if (button) {
      const span = document.createElement('span');
      span.className = 'github-user';
      span.append(icon('github'));
      if (this.repoURL) {
        span.append(a(this.username, this.repoURL, '_blank'));
        span.append(document.createTextNode(' '));
        span.append(a('PRs', `${this.repoURL}/pulls`, '_blank'));
        span.append(document.createTextNode(' '));
        span.append(a('Branches', `${this.repoURL}/branches/all`, '_blank'));
      } else {
        span.append(text(this.username));
      }
      button.replaceWith(span);
    }
  }

  async makeStorage() {
    let branch = window.location.pathname.substring(1);

    if (branch.endsWith('/')) {
      branch = branch.substring(0, branch.length - 1);
    }

    let repo = null;
    if (github.hasToken()) {
      repo = await this.connectToGithub();
    } else {
      repo = null;
      this.showLoginFlow();
    }

    // repo can be null either because we didn't have a github token or because
    // the connectToGithub failed.
    this.storage = files(branch, repo);
    return this.storage;
  }
}

const toggleInfo = () => {
  if ($('#login-flow').hidden) {
    showInfo();
  } else {
    hideInfo();
  }
};

const showInfo = () => {
  const b = $('#login-flow');
  $$('#login-flow > div').forEach((e) => {
    e.hidden = true;
  });
  b.querySelector('.x').style.display = 'inline';
  b.querySelector('.info').hidden = false;
  b.hidden = false;
};

const hideInfo = () => {
  $('#login-flow').hidden = true;
};

export default Login;
