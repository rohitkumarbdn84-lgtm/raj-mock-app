// ==========================================
// RAJ MOCK TEST V2.0
// STUDENT LOGIN
// FIRESTORE CONNECTED
// OLD STUDENTS SUPPORTED
// ==========================================

import { db } from "./firebase.js";

import {
    collection,
    getDocs,
    query,
    where
} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";


// ==========================================
// LOGIN FUNCTION
// ==========================================

window.loginStudent = async function () {

    const mobileInput =
        document.getElementById("mobile");

    const passwordInput =
        document.getElementById("password");


    if (!mobileInput || !passwordInput) {

        console.error(
            "❌ Mobile or Password field not found."
        );

        return;

    }


    const mobile =
        mobileInput.value.trim();

    const password =
        passwordInput.value.trim();


    // ======================================
    // VALIDATION
    // ======================================

    if (!mobile || !password) {

        alert(
            "⚠️ Please enter Mobile Number & Password."
        );

        return;

    }


    if (mobile.length !== 10) {

        alert(
            "⚠️ Please enter a valid 10 digit mobile number."
        );

        return;

    }


    // ======================================
    // LOGIN BUTTON
    // ======================================

    const loginButton =
        document.querySelector(
            "button[type='submit'], .login-btn"
        );


    if (loginButton) {

        loginButton.disabled = true;

        loginButton.textContent =
            "Logging in...";

    }


    try {

        console.log(
            "================================="
        );

        console.log(
            "🔐 STUDENT LOGIN"
        );

        console.log(
            "Mobile:",
            mobile
        );

        console.log(
            "================================="
        );


        // ==================================
        // FIND OLD STUDENT
        // ==================================

        const studentsRef =
            collection(
                db,
                "students"
            );


        const studentQuery =
            query(

                studentsRef,

                where(
                    "mobile",
                    "==",
                    mobile
                ),

                where(
                    "password",
                    "==",
                    password
                )

            );


        const snapshot =
            await getDocs(
                studentQuery
            );


        // ==================================
        // INVALID LOGIN
        // ==================================

        if (snapshot.empty) {

            alert(
                "❌ Invalid Mobile Number or Password."
            );


            if (loginButton) {

                loginButton.disabled =
                    false;

                loginButton.textContent =
                    "Login";

            }


            return;

        }


        // ==================================
        // GET STUDENT
        // ==================================

        const studentDoc =
            snapshot.docs[0];


        const data =
            studentDoc.data();


        const studentId =
            studentDoc.id;


        const studentName =
            data.name
            ||
            data.studentName
            ||
            "Student";


        const studentMobile =
            data.mobile
            ||
            mobile;


        const studentEmail =
            data.email
            ||
            "";


        const studentCourse =
            data.course
            ||
            "";


        const studentPhoto =
            data.photo
            ||
            "images/default-avatar.png";


        // ==================================
        // STUDENT OBJECT
        // ==================================

        const student = {

            id:
                studentId,

            name:
                studentName,

            mobile:
                studentMobile,

            email:
                studentEmail,

            course:
                studentCourse,

            photo:
                studentPhoto

        };


        // ==================================
        // OLD SESSION
        // ==================================

        sessionStorage.setItem(
            "student",
            JSON.stringify(
                student
            )
        );


        // ==================================
        // NEW LOGIN DATA
        // ==================================

        localStorage.setItem(
            "studentId",
            String(
                studentId
            )
        );


        localStorage.setItem(
            "studentName",
            String(
                studentName
            )
        );


        localStorage.setItem(
            "studentMobile",
            String(
                studentMobile
            )
        );


        localStorage.setItem(
            "studentEmail",
            String(
                studentEmail
            )
        );


        localStorage.setItem(
            "studentCourse",
            String(
                studentCourse
            )
        );


        localStorage.setItem(
            "studentPhoto",
            String(
                studentPhoto
            )
        );


        // ==================================
        // SESSION STORAGE TOO
        // ==================================

        sessionStorage.setItem(
            "studentId",
            String(
                studentId
            )
        );


        sessionStorage.setItem(
            "studentName",
            String(
                studentName
            )
        );


        sessionStorage.setItem(
            "studentMobile",
            String(
                studentMobile
            )
        );


        sessionStorage.setItem(
            "studentEmail",
            String(
                studentEmail
            )
        );


        // ==================================
        // DEBUG
        // ==================================

        console.log(
            "✅ LOGIN SUCCESS"
        );

        console.log(
            "Student ID:",
            studentId
        );

        console.log(
            "Student Name:",
            studentName
        );

        console.log(
            "Student Mobile:",
            studentMobile
        );


        // ==================================
        // DASHBOARD
        // ==================================

        window.location.href =
            "student-dashboard-v2.html";

    }
    catch (error) {

        console.error(
            "❌ LOGIN ERROR:",
            error
        );


        alert(
            "⚠️ Login failed.\n\n" +
            (
                error.message
                ||
                "Please try again."
            )
        );


        if (loginButton) {

            loginButton.disabled =
                false;

            loginButton.textContent =
                "Login";

        }

    }

};
