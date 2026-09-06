const TOKEN_KEY = "centuria_token";
const USER_KEY = "centuria_user";

export function saveAuth(token, user) {
    if (token) {
        localStorage.setItem(
            TOKEN_KEY,
            token
        );
    }

    if (user) {
        localStorage.setItem(
            USER_KEY,
            JSON.stringify(user)
        );
    }
}

export function getToken() {
    return localStorage.getItem(
        TOKEN_KEY
    );
}

export function getUser() {
    const user = localStorage.getItem(
        USER_KEY
    );

    if (!user) {
        return null;
    }

    try {
        return JSON.parse(user);
    } catch {
        return null;
    }
}

export function isLoggedIn() {
    return Boolean(
        getToken()
    );
}

export function isAdmin() {
    const user = getUser();

    return (
        user &&
        ["admin", "manager"].includes(
            String(user.role).toLowerCase()
        )
    );
}

export function logout() {
    localStorage.removeItem(
        TOKEN_KEY
    );

    localStorage.removeItem(
        USER_KEY
    );
}

export function getAuthHeaders() {
    const token = getToken();

    return {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`
    };
}