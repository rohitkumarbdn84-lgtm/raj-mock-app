// ==========================================
// RAJ MOCK TEST V2.0
// PREMIUM PAYMENT
// FIRESTORE PAYMENT REQUEST
// ==========================================

import { db } from "./firebase.js";

import {
    collection,
    addDoc,
    serverTimestamp
} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";


// ==========================================
// ELEMENTS
// ==========================================

const copyBtn =
    document.getElementById("copyBtn");

const upiId =
    document.getElementById("upiId");

const submitBtn =
    document.getElementById("submitPayment");

const txnId =
    document.getElementById("txnId");

const backBtn =
    document.getElementById("backBtn");


// ==========================================
// GET LOGGED-IN STUDENT
// IMPORTANT:
// MOBILE NUMBER AND STUDENT DOCUMENT ID
// ARE TWO DIFFERENT THINGS
// ==========================================

function getStudent() {

    let student = null;

    // ------------------------------------------
    // PRIMARY: sessionStorage student object
    // ------------------------------------------

    try {

        const data =
            sessionStorage.getItem("student");

        if (data) {

            student =
                JSON.parse(data);

        }

    } catch (error) {

        console.error(
            "❌ Student JSON error:",
            error
        );

    }


    // ------------------------------------------
    // ACTUAL MOBILE NUMBER
    // ------------------------------------------

    const mobile =
        student?.mobile ||
        student?.phone ||
        student?.mobileNumber ||
        localStorage.getItem("studentMobile") ||
        sessionStorage.getItem("studentMobile") ||
        "";


    // ------------------------------------------
    // STUDENT FIRESTORE DOCUMENT ID
    // This is NOT mobile
    // ------------------------------------------

    const studentId =
        student?.id ||
        localStorage.getItem("studentId") ||
        sessionStorage.getItem("studentId") ||
        "";


    // ------------------------------------------
    // NAME
    // ------------------------------------------

    const name =
        student?.name ||
        localStorage.getItem("studentName") ||
        sessionStorage.getItem("studentName") ||
        "Student";


    // ------------------------------------------
    // EMAIL
    // ------------------------------------------

    const email =
        student?.email ||
        localStorage.getItem("studentEmail") ||
        sessionStorage.getItem("studentEmail") ||
        "";


    return {

        studentId:
            String(studentId).trim(),

        mobile:
            String(mobile).trim(),

        name:
            String(name).trim(),

        email:
            String(email).trim()

    };

}


const loggedStudent =
    getStudent();


// ==========================================
// DEBUG
// ==========================================

console.log(
    "=========================================="
);

console.log(
    "👤 LOGGED-IN STUDENT"
);

console.log(
    "=========================================="
);

console.log(
    "Student ID:",
    loggedStudent.studentId
);

console.log(
    "Student Mobile:",
    loggedStudent.mobile
);

console.log(
    "Student Name:",
    loggedStudent.name
);

console.log(
    "Student Email:",
    loggedStudent.email
);


// ==========================================
// LOGIN CHECK
// MOBILE IS REQUIRED
// ==========================================

if (!loggedStudent.mobile) {

    alert(
        "❌ Student mobile number not found.\n\nPlease login again."
    );

    window.location.href =
        "student-login-v2.html";

}


// ==========================================
// COPY UPI
// ==========================================

if (copyBtn && upiId) {

    copyBtn.addEventListener(
        "click",
        async function () {

            try {

                await navigator.clipboard.writeText(
                    upiId.value
                );

                copyBtn.textContent =
                    "✅ Copied";

                setTimeout(
                    () => {

                        copyBtn.textContent =
                            "📋 Copy";

                    },
                    2000
                );

            }

            catch (error) {

                console.error(
                    "❌ Copy error:",
                    error
                );

                try {

                    upiId.select();

                    document.execCommand(
                        "copy"
                    );

                    copyBtn.textContent =
                        "✅ Copied";

                    setTimeout(
                        () => {

                            copyBtn.textContent =
                                "📋 Copy";

                        },
                        2000
                    );

                }

                catch {

                    alert(
                        "UPI ID copy नहीं हो पाया."
                    );

                }

            }

        }
    );

}


// ==========================================
// SUBMIT PAYMENT
// ==========================================

if (submitBtn) {

    submitBtn.addEventListener(
        "click",
        async function () {

            // ----------------------------------
            // ALWAYS GET CURRENT LOGIN DATA
            // ----------------------------------

            const student =
                getStudent();


            const transactionId =
                txnId
                    ? txnId.value.trim()
                    : "";


            // ----------------------------------
            // MOBILE VALIDATION
            // ----------------------------------

            if (!student.mobile) {

                alert(
                    "❌ Student mobile number नहीं मिला.\n\nPlease login again."
                );

                return;

            }


            // ----------------------------------
            // TRANSACTION ID VALIDATION
            // ----------------------------------

            if (!transactionId) {

                alert(
                    "Please enter your UPI Transaction ID."
                );

                if (txnId) {
                    txnId.focus();
                }

                return;

            }


            if (
                transactionId.length < 5
            ) {

                alert(
                    "Please enter a valid Transaction ID."
                );

                if (txnId) {
                    txnId.focus();
                }

                return;

            }


            // ----------------------------------
            // BUTTON LOADING
            // ----------------------------------

            submitBtn.disabled =
                true;

            submitBtn.textContent =
                "Submitting...";


            try {

                // ==================================
                // PAYMENT REQUEST DATA
                // ==================================

                const paymentData = {

                    // Firestore Student Document ID
                    studentId:
                        student.studentId,

                    // IMPORTANT:
                    // Actual Login Mobile Number
                    mobile:
                        student.mobile,

                    studentName:
                        student.name,

                    email:
                        student.email,

                    plan:
                        "Premium",

                    amount:
                        199,

                    transactionId:
                        transactionId,

                    status:
                        "Pending",

                    createdAt:
                        serverTimestamp(),

                    createdAtISO:
                        new Date().toISOString()

                };


                console.log(
                    "=========================================="
                );

                console.log(
                    "💳 PAYMENT REQUEST"
                );

                console.log(
                    "=========================================="
                );

                console.log(
                    "Student ID:",
                    paymentData.studentId
                );

                console.log(
                    "Mobile:",
                    paymentData.mobile
                );

                console.log(
                    "Name:",
                    paymentData.studentName
                );

                console.log(
                    "Transaction:",
                    paymentData.transactionId
                );


                // ==================================
                // SAVE TO FIRESTORE
                // ==================================

                await addDoc(
                    collection(
                        db,
                        "paymentRequests"
                    ),
                    paymentData
                );


                // ==================================
                // SUCCESS
                // ==================================

                alert(
                    "✅ Payment Request Submitted Successfully!\n\n" +

                    "Student: " +
                    student.name +

                    "\nMobile: " +
                    student.mobile +

                    "\nTransaction ID: " +
                    transactionId +

                    "\n\nAdmin verification के बाद Premium Activate किया जाएगा."
                );


                if (txnId) {

                    txnId.value =
                        "";

                }


                // ==================================
                // DASHBOARD
                // ==================================

                window.location.href =
                    "student-dashboard-v2.html";

            }

            catch (error) {

                console.error(
                    "❌ PAYMENT ERROR:",
                    error
                );

                alert(
                    "❌ Payment request submit नहीं हो सकी.\n\n" +
                    (
                        error.message ||
                        "Please try again."
                    )
                );

            }

            finally {

                submitBtn.disabled =
                    false;

                submitBtn.textContent =
                    "Submit Payment Request";

            }

        }
    );

}


// ==========================================
// BACK TO DASHBOARD
// ==========================================

if (backBtn) {

    backBtn.addEventListener(
        "click",
        function () {

            window.location.href =
                "student-dashboard-v2.html";

        }
    );

}


// ==========================================
// START
// ==========================================

console.log(
    "🚀 Raj Mock Test V2.0 Premium Payment Started"
);