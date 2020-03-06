const loginBtn = document.getElementById('loginBtn');
const logoutBtn = document.getElementById('logoutBtn');
import createAuth0Client from '@auth0/auth0-spa-js';

let auth0 = null;
window.onload = async () => {
    auth0 = await createAuth0Client({
        domain: 'jqq-intervie-test.auth0.com',
        client_id: 'nXHTUKU8xb0bie5NPgj8kQI8nt5mk3Wi',
        audience: 'https://learnbuildtypeapi'
    });

    updateNav();

    const isAuthenticated = await auth0.isAuthenticated();

    if (isAuthenticated) {
        // show the gated content
        return;
    }

    // NEW - check for the code and state parameters
    const query = window.location.search;
    if (query.includes('code=') && query.includes('state=')) {
        // Process the login state
        await auth0.handleRedirectCallback();

        updateNav();

        // Use replaceState to redirect the user away and remove the querystring parameters
        window.history.replaceState({}, document.title, '/');
    }
};

const login = async () => {
    await auth0.loginWithRedirect({
        redirect_uri: window.location.origin
    });
};

const logout = () => {
    auth0.logout({
        returnTo: window.location.origin
    });
};

loginBtn.addEventListener('click', login);
logoutBtn.addEventListener('click', logout);

const updateNav = async () => {
    const isAuthenticated = await auth0.isAuthenticated();

    if (isAuthenticated) {
        logoutBtn.classList.remove('hidden');
        loginBtn.classList.add('hidden');
    } else {
        logoutBtn.classList.add('hidden');
        loginBtn.classList.remove('hidden');
    }
};

export { login, logout, updateNav, auth0 };
