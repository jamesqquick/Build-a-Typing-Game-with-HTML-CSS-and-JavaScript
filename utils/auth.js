let auth0 = null;
window.onload = async () => {
    auth0 = await createAuth0Client({
        domain: 'jqq-intervie-test.auth0.com',
        client_id: 'nXHTUKU8xb0bie5NPgj8kQI8nt5mk3Wi'
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

const updateNav = async () => {
    const isAuthenticated = await auth0.isAuthenticated();

    if (isAuthenticated) {
        document.getElementById('btn-logout').classList.remove('hidden');
        document.getElementById('btn-login').classList.add('hidden');
    } else {
        document.getElementById('btn-logout').classList.add('hidden');
        document.getElementById('btn-login').classList.remove('hidden');
    }
};

export { login, logout, updateNav };
