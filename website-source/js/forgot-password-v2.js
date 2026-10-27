// ==========================================================
// RAJ MOCK TEST V2.0
// FORGOT PASSWORD
// FIRESTORE
// MOBILE + EMAIL VERIFICATION
// PASSWORD RESET
// ==========================================================


console.log("🔥 FORGOT PASSWORD V2 JS LOADING...");


/* ==========================================================
   FIREBASE
========================================================== */

import { db } from "./firebase.js";

import {
    collection,
    getDocs,
    query,
    where,
    updateDoc
} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";


console.log("✅ Firebase module loaded");


/* ==========================================================
   ELEMENTS
========================================================== */

const mobileInput =
    document.getElementById("mobile");

const emailInput =
    document.getElementById("email");

const verifyBtn =
    document.getElementById("submitBtn");

const resetBtn =
    document.getElementById("resetBtn");

const passwordSection =
    document.getElementById("passwordSection");

const newPasswordInput =
    document.getElementById("newPassword");

const confirmPasswordInput =
    document.getElementById("confirmPassword");

const messageBox =
    document.getElementById("message");


/* ==========================================================
   DEBUG
========================================================== */

console.log(
    "Mobile:",
    mobileInput
);

console.log(
    "Email:",
    emailInput
);

console.log(
    "Verify Button:",
    verifyBtn
);

console.log(
    "Reset Button:",
    resetBtn
);

console.log(
    "Password Section:",
    passwordSection
);

console.log(
    "Message:",
    messageBox
);


/* ==========================================================
   CHECK ELEMENTS
========================================================== */

if (!mobileInput) {

    console.error(
        "❌ Mobile input not found"
    );

}

if (!emailInput) {

    console.error(
        "❌ Email input not found"
    );

}

if (!verifyBtn) {

    console.error(
        "❌ VERIFY BUTTON NOT FOUND"
    );

}

if (!resetBtn) {

    console.error(
        "❌ RESET BUTTON NOT FOUND"
    );

}


/* ==========================================================
   STATE
========================================================== */

let verifiedStudentRef = null;


/* ==========================================================
   MESSAGE
========================================================== */

function showMessage(
    message,
    type = "error"
){

    if(!messageBox){

        alert(message);

        return;

    }


    messageBox.textContent =
        message;


    messageBox.className =
        "show " + type;

}


/* ==========================================================
   CLEAR MESSAGE
========================================================== */

function clearMessage(){

    if(!messageBox){
        return;
    }

    messageBox.textContent =
        "";

    messageBox.className =
        "";

}


/* ==========================================================
   MOBILE ONLY NUMBERS
========================================================== */

if(mobileInput){

    mobileInput.addEventListener(
        "input",
        function(){

            this.value =
                this.value.replace(
                    /\D/g,
                    ""
                );

        }
    );

}


/* ==========================================================
   VERIFY BUTTON
========================================================== */

if(verifyBtn){

    verifyBtn.addEventListener(
        "click",
        verifyAccount
    );

    console.log(
        "✅ VERIFY BUTTON EVENT ATTACHED"
    );

}


/* ==========================================================
   VERIFY ACCOUNT
========================================================== */

async function verifyAccount(){

    console.log(
        "🟢 VERIFY BUTTON CLICKED"
    );


    clearMessage();


    /* ======================================================
       GET VALUES
    ====================================================== */

    const mobile =
        mobileInput
            ? mobileInput.value.trim()
            : "";


    const email =
        emailInput
            ? emailInput.value.trim().toLowerCase()
            : "";


    console.log(
        "Mobile entered:",
        mobile
    );

    console.log(
        "Email entered:",
        email
    );


    /* ======================================================
       MOBILE VALIDATION
    ====================================================== */

    if(!mobile){

        showMessage(
            "⚠️ Please enter your mobile number."
        );

        return;

    }


    if(!/^[0-9]{10}$/.test(mobile)){

        showMessage(
            "⚠️ Please enter a valid 10 digit mobile number."
        );

        return;

    }


    /* ======================================================
       EMAIL VALIDATION
    ====================================================== */

    if(!email){

        showMessage(
            "⚠️ Please enter your registered email."
        );

        return;

    }


    if(!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)){

        showMessage(
            "⚠️ Please enter a valid email address."
        );

        return;

    }


    /* ======================================================
       BUTTON LOADING
    ====================================================== */

    verifyBtn.disabled =
        true;

    verifyBtn.innerHTML =
        '<i class="fa-solid fa-spinner fa-spin"></i> Verifying...';


    try{


        console.log(
            "📚 Searching students collection..."
        );


        /* ==================================================
           STUDENTS COLLECTION
        ================================================== */

        const studentsRef =
            collection(
                db,
                "students"
            );


        /* ==================================================
           SEARCH MOBILE
        ================================================== */

        const studentQuery =
            query(
                studentsRef,
                where(
                    "mobile",
                    "==",
                    mobile
                )
            );


        const snapshot =
            await getDocs(
                studentQuery
            );


        console.log(
            "📊 Records found:",
            snapshot.size
        );


        /* ==================================================
           MOBILE NOT FOUND
        ================================================== */

        if(snapshot.empty){

            showMessage(
                "❌ This mobile number is not registered."
            );


            verifyBtn.disabled =
                false;


            verifyBtn.innerHTML =
                '<i class="fa-solid fa-circle-check"></i> Verify Account';


            return;

        }


        /* ==================================================
           CHECK EMAIL
        ================================================== */

        let matchedDocument =
            null;


        for(
            const studentDoc
            of snapshot.docs
        ){

            const data =
                studentDoc.data();


            const firestoreMobile =
                String(
                    data.mobile || ""
                ).trim();


            const firestoreEmail =
                String(
                    data.email || ""
                )
                .trim()
                .toLowerCase();


            console.log(
                "Student:",
                studentDoc.id
            );

            console.log(
                "Firestore Mobile:",
                firestoreMobile
            );

            console.log(
                "Firestore Email:",
                firestoreEmail
            );


            if(
                firestoreMobile === mobile &&
                firestoreEmail === email
            ){

                matchedDocument =
                    studentDoc;

                break;

            }

        }


        /* ==================================================
           EMAIL NOT MATCH
        ================================================== */

        if(!matchedDocument){

            showMessage(
                "❌ Mobile Number and Email do not match."
            );


            verifyBtn.disabled =
                false;


            verifyBtn.innerHTML =
                '<i class="fa-solid fa-circle-check"></i> Verify Account';


            return;

        }


        /* ==================================================
           ACCOUNT VERIFIED
        ================================================== */

        verifiedStudentRef =
            matchedDocument.ref;


        console.log(
            "===================================="
        );

        console.log(
            "✅ ACCOUNT VERIFIED SUCCESSFULLY"
        );

        console.log(
            "Student ID:",
            matchedDocument.id
        );

        console.log(
            "===================================="
        );


        /* ==================================================
           SHOW PASSWORD SECTION
        ================================================== */

        if(passwordSection){

            passwordSection.style.display =
                "block";

        }


        /* ==================================================
           DISABLE VERIFIED DETAILS
        ================================================== */

        mobileInput.disabled =
            true;

        emailInput.disabled =
            true;


        verifyBtn.disabled =
            true;


        verifyBtn.innerHTML =
            '<i class="fa-solid fa-circle-check"></i> Account Verified';


        /* ==================================================
           SUCCESS MESSAGE
        ================================================== */

        showMessage(
            "✅ Account verified successfully. Please create your new password.",
            "success"
        );

    }
    catch(error){

        console.error(
            "❌ VERIFY ERROR:",
            error
        );


        showMessage(
            "⚠️ Verification failed: " +
            error.message
        );


        verifyBtn.disabled =
            false;


        verifyBtn.innerHTML =
            '<i class="fa-solid fa-circle-check"></i> Verify Account';

    }

}


/* ==========================================================
   RESET BUTTON
========================================================== */

if(resetBtn){

    resetBtn.addEventListener(
        "click",
        resetPassword
    );


    console.log(
        "✅ RESET BUTTON EVENT ATTACHED"
    );

}


/* ==========================================================
   RESET PASSWORD
========================================================== */

async function resetPassword(){

    console.log(
        "🟢 RESET PASSWORD CLICKED"
    );


    clearMessage();


    /* ======================================================
       VERIFY FIRST
    ====================================================== */

    if(!verifiedStudentRef){

        showMessage(
            "⚠️ Please verify your account first."
        );

        return;

    }


    /* ======================================================
       GET PASSWORDS
    ====================================================== */

    const newPassword =
        newPasswordInput
            ? newPasswordInput.value.trim()
            : "";


    const confirmPassword =
        confirmPasswordInput
            ? confirmPasswordInput.value.trim()
            : "";


    /* ======================================================
       VALIDATION
    ====================================================== */

    if(!newPassword){

        showMessage(
            "⚠️ Please enter your new password."
        );

        return;

    }


    if(newPassword.length < 6){

        showMessage(
            "⚠️ Password must contain at least 6 characters."
        );

        return;

    }


    if(!confirmPassword){

        showMessage(
            "⚠️ Please confirm your new password."
        );

        return;

    }


    if(
        newPassword !==
        confirmPassword
    ){

        showMessage(
            "❌ New password and confirm password do not match."
        );

        return;

    }


    /* ======================================================
       LOADING
    ====================================================== */

    resetBtn.disabled =
        true;


    resetBtn.innerHTML =
        '<i class="fa-solid fa-spinner fa-spin"></i> Updating Password...';


    try{


        console.log(
            "🔄 Updating Firestore password..."
        );


        /* ==================================================
           UPDATE PASSWORD
        ================================================== */

        await updateDoc(
            verifiedStudentRef,
            {
                password:
                    newPassword
            }
        );


        console.log(
            "✅ PASSWORD UPDATED"
        );


        /* ==================================================
           SUCCESS
        ================================================== */

        showMessage(
            "✅ Password reset successfully. Redirecting to login...",
            "success"
        );


        /* ==================================================
           REDIRECT
        ================================================== */

        setTimeout(
            function(){

                window.location.replace(
                    "student-login-v2.html"
                );

            },
            1500
        );

    }
    catch(error){

        console.error(
            "❌ PASSWORD RESET ERROR:",
            error
        );


        showMessage(
            "⚠️ Password update failed: " +
            error.message
        );


        resetBtn.disabled =
            false;


        resetBtn.innerHTML =
            '<i class="fa-solid fa-key"></i> Reset Password';

    }

}


/* ==========================================================
   READY
========================================================== */

console.log(
    "🚀 FORGOT PASSWORD V2 READY"
);