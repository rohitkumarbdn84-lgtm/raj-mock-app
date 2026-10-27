// ==========================================================
// RAJ MOCK TEST V2.0
// STUDENT PROFILE
// FIREBASE RESULTS
// ==========================================================

import { db } from "./firebase.js";

import {
    collection,
    getDocs
} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";


// ==========================================================
// LOGIN DATA
// ==========================================================

const studentName =
    localStorage.getItem("studentName") ||
    sessionStorage.getItem("studentName") ||
    "Student";

const studentMobile =
    localStorage.getItem("studentMobile") ||
    sessionStorage.getItem("studentMobile") ||
    "";

const studentId =
    localStorage.getItem("studentId") ||
    sessionStorage.getItem("studentId") ||
    studentMobile;


// ==========================================================
// PAGE ELEMENTS
// ==========================================================

const profileName =
    document.getElementById("profileName");

const profileMobile =
    document.getElementById("profileMobile");

const profileAvatar =
    document.getElementById("profileAvatar");

const totalTests =
    document.getElementById("totalTests");

const averageScore =
    document.getElementById("averageScore");

const bestScore =
    document.getElementById("bestScore");

const totalCorrect =
    document.getElementById("totalCorrect");

const totalQuestions =
    document.getElementById("totalQuestions");

const accuracy =
    document.getElementById("accuracy");


// ==========================================================
// SHOW BASIC PROFILE
// ==========================================================

function loadBasicProfile() {

    if (profileName) {
        profileName.textContent = studentName;
    }

    if (profileMobile) {
        profileMobile.textContent =
            studentMobile || "Mobile not available";
    }

    if (profileAvatar) {
        profileAvatar.textContent =
            studentName
                .charAt(0)
                .toUpperCase();
    }

}


// ==========================================================
// LOAD RESULTS
// ==========================================================

async function loadProfileStats() {

    try {

        console.log("👤 Student Name:", studentName);
        console.log("📱 Student Mobile:", studentMobile);
        console.log("🆔 Student ID:", studentId);

        const resultsRef =
            collection(
                db,
                "results"
            );

        const snapshot =
            await getDocs(
                resultsRef
            );


        let myResults = [];


        // ==================================================
        // FIND STUDENT RESULTS
        // ==================================================

        snapshot.forEach(docSnap => {

            const data =
                docSnap.data();

            console.log(
                "📊 RESULT:",
                docSnap.id,
                data
            );


            const resultStudentId =
                String(
                    data.studentId ||
                    data.mobile ||
                    data.studentMobile ||
                    data.userId ||
                    ""
                ).trim();


            const currentStudentId =
                String(
                    studentId
                ).trim();


            const resultMobile =
                String(
                    data.mobile ||
                    data.studentMobile ||
                    ""
                ).trim();


            const currentMobile =
                String(
                    studentMobile
                ).trim();


            // ------------------------------------------------
            // MATCH STUDENT
            // ------------------------------------------------

            if (
                resultStudentId === currentStudentId ||
                (
                    currentMobile &&
                    resultMobile === currentMobile
                )
            ) {

                myResults.push(data);

            }

        });


        console.log(
            "✅ MY RESULTS:",
            myResults
        );


        // ==================================================
        // NO RESULT
        // ==================================================

        if (myResults.length === 0) {

            setValue(
                totalTests,
                "0"
            );

            setValue(
                averageScore,
                "0%"
            );

            setValue(
                bestScore,
                "0%"
            );

            setValue(
                totalCorrect,
                "0"
            );

            setValue(
                totalQuestions,
                "0"
            );

            setValue(
                accuracy,
                "0%"
            );

            return;
        }


        // ==================================================
        // CALCULATE STATISTICS
        // ==================================================

        let totalCorrectCount = 0;

        let totalQuestionCount = 0;

        let percentageTotal = 0;

        let highestPercentage = 0;


        myResults.forEach(result => {

            // ----------------------------------------------
            // CORRECT
            // ----------------------------------------------

            const correct =
                Number(
                    result.correct ||
                    result.correctAnswers ||
                    result.correctCount ||
                    0
                );


            // ----------------------------------------------
            // TOTAL QUESTIONS
            // ----------------------------------------------

            const questions =
                Number(
                    result.totalQuestions ||
                    result.totalQuestion ||
                    result.questions ||
                    result.total ||
                    0
                );


            // ----------------------------------------------
            // PERCENTAGE
            // ----------------------------------------------

            let percentage =
                Number(
                    result.percentage ||
                    result.percent ||
                    result.scorePercentage ||
                    0
                );


            // ----------------------------------------------
            // IF PERCENTAGE NOT SAVED
            // CALCULATE FROM CORRECT/TOTAL
            // ----------------------------------------------

            if (
                percentage === 0 &&
                questions > 0
            ) {

                percentage =
                    (
                        correct /
                        questions
                    ) * 100;

            }


            totalCorrectCount +=
                correct;

            totalQuestionCount +=
                questions;

            percentageTotal +=
                percentage;


            if (
                percentage >
                highestPercentage
            ) {

                highestPercentage =
                    percentage;

            }

        });


        // ==================================================
        // FINAL VALUES
        // ==================================================

        const testCount =
            myResults.length;


        const average =
            percentageTotal /
            testCount;


        const finalAccuracy =
            totalQuestionCount > 0
                ?
                (
                    totalCorrectCount /
                    totalQuestionCount
                ) * 100
                :
                0;


        // ==================================================
        // DISPLAY
        // ==================================================

        setValue(
            totalTests,
            testCount
        );

        setValue(
            averageScore,
            formatPercent(average)
        );

        setValue(
            bestScore,
            formatPercent(highestPercentage)
        );

        setValue(
            totalCorrect,
            totalCorrectCount
        );

        setValue(
            totalQuestions,
            totalQuestionCount
        );

        setValue(
            accuracy,
            formatPercent(finalAccuracy)
        );


        console.log(
            "📈 PROFILE STATS",
            {
                tests: testCount,
                average: average,
                best: highestPercentage,
                correct: totalCorrectCount,
                questions: totalQuestionCount,
                accuracy: finalAccuracy
            }
        );

    }
    catch (error) {

        console.error(
            "❌ PROFILE ERROR:",
            error
        );

    }

}


// ==========================================================
// HELPER
// ==========================================================

function setValue(
    element,
    value
) {

    if (element) {

        element.textContent =
            value;

    }

}


function formatPercent(value) {

    return (
        Number(value) || 0
    ).toFixed(1) + "%";

}

// ==========================================================
// BACK TO DASHBOARD
// ==========================================================

const backBtn = document.getElementById("backBtn");

if (backBtn) {

    backBtn.addEventListener("click", function () {

        console.log("🏠 Back to Dashboard clicked");

        window.location.href = "student-dashboard-v2.html";

    });

}

// ==========================================================
// LOGOUT
// ==========================================================

const logoutBtn =
    document.getElementById(
        "logoutBtn"
    );

if (logoutBtn) {

    logoutBtn.addEventListener(
        "click",
        function () {

            const confirmLogout =
                confirm(
                    "Are you sure you want to logout?"
                );

            if (!confirmLogout) {
                return;
            }


            localStorage.clear();
            sessionStorage.clear();


            window.location.replace(
                "student-login-v2.html"
            );

        }
    );

}


// ==========================================================
// START
// ==========================================================

console.log(
    "🚀 PROFILE V2 STARTED"
);

loadBasicProfile();

loadProfileStats();
