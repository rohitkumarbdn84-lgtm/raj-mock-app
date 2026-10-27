// ==========================================================
// RAJ MOCK TEST V2.0
// ADMIN LOGIN
// FIREBASE AUTHENTICATION
// ==========================================================

import { auth } from "./firebase.js";

import {
    signInWithEmailAndPassword,
    signOut
} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-auth.js";


// ==========================================================
// DEBUG
// ==========================================================

console.log("======================================");
console.log("🚀 ADMIN LOGIN JS STARTED");
console.log("======================================");

console.log("🔥 Firebase Auth:", auth);


// ==========================================================
// LOGIN FORM
// ==========================================================

const form = document.getElementById("loginForm");

const emailInput = document.getElementById("email");

const passwordInput = document.getElementById("password");


if (!form) {

    console.error("❌ loginForm NOT FOUND");

} else {

    console.log("✅ loginForm FOUND");


    // ======================================================
    // LOGIN SUBMIT
    // ======================================================

    form.addEventListener("submit", async (e) => {

        e.preventDefault();


        // ==================================================
        // GET VALUES
        // ==================================================

        const email = emailInput.value.trim();

        const password = passwordInput.value;


        console.log("📧 Email:", email);

        console.log(
            "🔑 Password entered:",
            password ? "YES" : "NO"
        );


        // ==================================================
        // VALIDATION
        // ==================================================

        if (!email || !password) {

            alert(
                "⚠️ Please enter email and password."
            );

            return;
        }


        // ==================================================
        // BUTTON
        // ==================================================

        const button =
            form.querySelector(".login-btn");


        if (button) {

            button.disabled = true;

            button.textContent =
                "⏳ Logging in...";
        }


        // ==================================================
        // FIREBASE LOGIN
        // ==================================================

        try {

            console.log(
                "🔐 Sending login request to Firebase..."
            );


            const userCredential =
                await signInWithEmailAndPassword(
                    auth,
                    email,
                    password
                );


            const user =
                userCredential.user;


            // ==================================================
            // SUCCESS
            // ==================================================

            console.log(
                "======================================"
            );

            console.log(
                "✅ ADMIN LOGIN SUCCESS"
            );

            console.log(
                "UID:",
                user.uid
            );

            console.log(
                "EMAIL:",
                user.email
            );

            console.log(
                "======================================"
            );


            // ==================================================
            // SAVE SESSION
            // ==================================================

            sessionStorage.setItem(
                "admin",
                user.uid
            );

            sessionStorage.setItem(
                "adminEmail",
                user.email || email
            );


            // ==================================================
            // REDIRECT
            // ==================================================

            window.location.replace(
                "./admin-dashboard-v2.html"
            );

        }


        // ======================================================
        // LOGIN ERROR
        // ======================================================

        catch (error) {

            console.error(
                "❌ FIREBASE ADMIN LOGIN ERROR:",
                error
            );


            let message =
                "❌ Login Failed.";


            switch (error.code) {

                case "auth/invalid-credential":

                    message =
                        "❌ Email या Password गलत है.";

                    break;


                case "auth/invalid-login-credentials":

                    message =
                        "❌ Email या Password गलत है.";

                    break;


                case "auth/wrong-password":

                    message =
                        "❌ Password गलत है.";

                    break;


                case "auth/user-not-found":

                    message =
                        "❌ यह Admin Email Firebase में नहीं मिला.";

                    break;


                case "auth/invalid-email":

                    message =
                        "❌ Email format गलत है.";

                    break;


                case "auth/user-disabled":

                    message =
                        "🚫 यह Admin account disabled है.";

                    break;


                case "auth/too-many-requests":

                    message =
                        "⚠️ बहुत ज्यादा login attempts हुए हैं.\n\nथोड़ी देर बाद फिर try करें.";

                    break;


                case "auth/network-request-failed":

                    message =
                        "🌐 Internet / Firebase network problem.";

                    break;


                case "auth/operation-not-allowed":

                    message =
                        "⚠️ Firebase में Email/Password Login enabled नहीं है.";

                    break;


                case "auth/invalid-api-key":

                    message =
                        "❌ Firebase API Key गलत है.";

                    break;


                case "auth/app-not-authorized":

                    message =
                        "❌ Firebase project में यह domain authorized नहीं है.";

                    break;


                default:

                    message =
                        "❌ Firebase Error\n\n" +
                        error.code +
                        "\n\n" +
                        error.message;

                    break;
            }


            alert(message);


            // ==================================================
            // RESET BUTTON
            // ==================================================

            if (button) {

                button.disabled = false;

                button.textContent =
                    "🔐 Login to Admin Panel";
            }

        }

    });

}


// ==========================================================
// ADMIN LOGOUT
// ==========================================================

window.logout = async function () {

    const confirmed =
        confirm(
            "🚪 Do you want to logout from Admin Panel?"
        );


    if (!confirmed) {

        return;
    }


    try {

        await signOut(auth);

        console.log(
            "✅ Firebase Admin Logout Successful"
        );

    } catch (error) {

        console.error(
            "❌ Firebase Logout Error:",
            error
        );

    }


    // ==================================================
    // CLEAR SESSION
    // ==================================================

    sessionStorage.removeItem("admin");

    sessionStorage.removeItem("adminEmail");


    // ==================================================
    // REDIRECT LOGIN
    // ==================================================

    window.location.replace(
        "./admin-login-v2.html"
    );

};