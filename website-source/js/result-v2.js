// ==========================================
// RAJ MOCK TEST V2.0
// RESULT ENGINE
// FIRESTORE CONNECTED
// ==========================================

import { db } from "./firebase.js";

import {
    collection,
    addDoc,
    serverTimestamp
} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";


// ==========================================
// GET SAVED RESULT
// ==========================================

const savedResult =
    localStorage.getItem("latestResult") ||
    localStorage.getItem("lastResult");


if (!savedResult) {

    alert("⚠️ Result data not found.");

    window.location.href =
        "student-tests-v2.html";

    throw new Error("Result data not found.");

}


let result = null;


try {

    result = JSON.parse(savedResult);

}
catch (error) {

    console.error(
        "❌ Result JSON Error:",
        error
    );

    alert("⚠️ Invalid result data.");

    window.location.href =
        "student-tests-v2.html";

    throw error;

}


// ==========================================
// ELEMENTS
// ==========================================

const studentNameElement =
    document.getElementById("studentName");

const studentAvatarElement =
    document.getElementById("studentAvatar");

const testNameElement =
    document.getElementById("testName");

const resultDateElement =
    document.getElementById("resultDate");

const percentageElement =
    document.getElementById("percentage");

const scoreTextElement =
    document.getElementById("scoreText");

const correctElement =
    document.getElementById("correct");

const wrongElement =
    document.getElementById("wrong");

const unattemptedElement =
    document.getElementById("unattempted");

const timeTakenElement =
    document.getElementById("timeTaken");

const performanceIcon =
    document.getElementById("performanceIcon");

const performanceTitle =
    document.getElementById("performanceTitle");

const performanceText =
    document.getElementById("performanceText");

const performanceFill =
    document.getElementById("performanceFill");

const detailTestName =
    document.getElementById("detailTestName");

const detailCategory =
    document.getElementById("detailCategory");

const detailTotal =
    document.getElementById("detailTotal");

const detailDuration =
    document.getElementById("detailDuration");


// ==========================================
// SAFE TEXT
// ==========================================

function setText(element, value) {

    if (element) {

        element.textContent =
            value ?? "";

    }

}


// ==========================================
// GET STUDENT ID
// ==========================================

function getStudentId() {

    const possibleIds = [

        localStorage.getItem("studentId"),

        sessionStorage.getItem("studentId"),

        localStorage.getItem("studentMobile"),

        sessionStorage.getItem("studentMobile"),

        localStorage.getItem("mobile"),

        sessionStorage.getItem("mobile")

    ];


    const studentId =
        possibleIds.find(
            value =>
                value &&
                String(value).trim() !== ""
        );


    return studentId
        ? String(studentId).trim()
        : "";

}


// ==========================================
// GET STUDENT NAME
// ==========================================

function getStudentName() {

    return (

        localStorage.getItem("studentName")

        ||

        sessionStorage.getItem("studentName")

        ||

        "Student"

    );

}


// ==========================================
// LOAD STUDENT
// ==========================================

function loadStudent() {

    const name =
        getStudentName();


    setText(
        studentNameElement,
        name
    );


    if (studentAvatarElement) {

        studentAvatarElement.textContent =
            name
                .charAt(0)
                .toUpperCase();

    }

}


loadStudent();


// ==========================================
// DISPLAY RESULT
// ==========================================

function displayResult() {

    const total =
        Number(
            result.total || 0
        );


    const correct =
        Number(
            result.correct || 0
        );


    const wrong =
        Number(
            result.wrong || 0
        );


    const unattempted =
        Number(
            result.unattempted || 0
        );


    const percentage =
        Number(
            result.percentage || 0
        );


    // ======================================
    // TEST NAME
    // ======================================

    setText(
        testNameElement,
        result.testName || "Mock Test"
    );


    setText(
        detailTestName,
        result.testName || "-"
    );


    setText(
        detailCategory,
        result.categoryName || "-"
    );


    // ======================================
    // SCORE
    // ======================================

    setText(
        percentageElement,
        `${percentage}%`
    );


    setText(
        scoreTextElement,
        `${correct} / ${total}`
    );


    // ======================================
    // STATISTICS
    // ======================================

    setText(
        correctElement,
        correct
    );


    setText(
        wrongElement,
        wrong
    );


    setText(
        unattemptedElement,
        unattempted
    );


    // ======================================
    // TIME
    // ======================================

    setText(
        timeTakenElement,
        formatTime(
            Number(
                result.timeTaken || 0
            )
        )
    );


    setText(
        detailTotal,
        total
    );


    setText(
        detailDuration,
        `${Number(result.duration || 0)} Min`
    );


    // ======================================
    // DATE
    // ======================================

    if (
        result.submittedAt
    ) {

        const date =
            new Date(
                result.submittedAt
            );


        if (
            !Number.isNaN(
                date.getTime()
            )
        ) {

            setText(

                resultDateElement,

                date.toLocaleString(
                    "en-IN",
                    {
                        day: "2-digit",
                        month: "short",
                        year: "numeric",
                        hour: "2-digit",
                        minute: "2-digit"
                    }
                )

            );

        }

    }


    // ======================================
    // PERFORMANCE
    // ======================================

    setPerformance(
        percentage
    );

}


// ==========================================
// FORMAT TIME
// ==========================================

function formatTime(seconds) {

    seconds =
        Math.max(
            0,
            Number(seconds) || 0
        );


    const minutes =
        Math.floor(
            seconds / 60
        );


    const remainingSeconds =
        seconds % 60;


    return (

        `${String(minutes).padStart(2, "0")}:` +

        `${String(remainingSeconds).padStart(2, "0")}`

    );

}


// ==========================================
// PERFORMANCE
// ==========================================

function setPerformance(
    percentage
) {

    if (performanceFill) {

        performanceFill.style.width =
            `${Math.min(
                Math.max(percentage, 0),
                100
            )}%`;

    }


    if (
        percentage >= 80
    ) {

        setText(
            performanceIcon,
            "🏆"
        );

        setText(
            performanceTitle,
            "Excellent Performance!"
        );

        setText(
            performanceText,
            "Outstanding score. Keep maintaining this performance."
        );

    }

    else if (
        percentage >= 60
    ) {

        setText(
            performanceIcon,
            "⭐"
        );

        setText(
            performanceTitle,
            "Good Performance!"
        );

        setText(
            performanceText,
            "Good score. A little more practice can take you higher."
        );

    }

    else if (
        percentage >= 40
    ) {

        setText(
            performanceIcon,
            "📚"
        );

        setText(
            performanceTitle,
            "Keep Practicing!"
        );

        setText(
            performanceText,
            "You are on the right track. Practice more to improve your score."
        );

    }

    else {

        setText(
            performanceIcon,
            "💪"
        );

        setText(
            performanceTitle,
            "More Practice Needed"
        );

        setText(
            performanceText,
            "Review the questions and practice this topic again."
        );

    }

}


// ==========================================
// PREPARE ANSWER KEY
// ==========================================
//
// Result page से questions आएंगे:
//
// result.questions
//
// Student answers:
//
// result.userAnswers
//
// Example:
//
// question.answer = 0
// userAnswers[0] = 1
//
// इसलिए Answer Key में दोनों save होंगे.
// ==========================================

function prepareAnswerKey() {

    const questions =
        Array.isArray(
            result.questions
        )
        ? result.questions
        : [];


    const userAnswers =
        Array.isArray(
            result.userAnswers
        )
        ? result.userAnswers
        : [];


    return questions.map(
        function (
            question,
            index
        ) {

            const selectedAnswer =
                userAnswers[index] !== undefined
                ? userAnswers[index]
                : null;


            const correctAnswer =
                Number.isInteger(
                    Number(question.answer)
                )
                ? Number(question.answer)
                : -1;


            return {

                questionId:
                    question.id || "",

                question:
                    question.question || "",

                options:
                    Array.isArray(
                        question.options
                    )
                    ? question.options
                    : [],

                correctAnswer,

                selectedAnswer,

                isCorrect:
                    selectedAnswer !== null
                    &&
                    selectedAnswer ===
                    correctAnswer,

                isUnattempted:
                    selectedAnswer === null

            };

        }
    );

}


// ==========================================
// SAVE RESULT TO FIRESTORE
// ==========================================

async function saveResultToFirestore() {

    try {

        console.log(
            "================================"
        );

        console.log(
            "🔥 SAVING RESULT TO FIRESTORE"
        );

        console.log(
            "================================"
        );


        // ==================================
        // STUDENT
        // ==================================

        const studentId =
            getStudentId();


        const studentName =
            getStudentName();


        console.log(
            "Student ID:",
            studentId
        );


        console.log(
            "Student Name:",
            studentName
        );


        // ==================================
        // TEST
        // ==================================

        console.log(
            "Test ID:",
            result.testId
        );


        console.log(
            "Test Name:",
            result.testName
        );


        // ==================================
        // ANSWER KEY
        // ==================================

        const answerKey =
            prepareAnswerKey();


        console.log(
            "Answer Key:",
            answerKey
        );


        // ==================================
        // CREATE RESULT DATA
        // ==================================

        const resultData = {

            // ------------------------------
            // STUDENT
            // ------------------------------

            studentId:
                studentId || "guest",

            studentName:
                studentName,

            // ------------------------------
            // TEST
            // ------------------------------

            testId:
                result.testId || "",

            testName:
                result.testName || "",

            categoryId:
                result.categoryId || "",

            categoryName:
                result.categoryName || "",

            // ------------------------------
            // SCORE
            // ------------------------------

            total:
                Number(
                    result.total || 0
                ),

            correct:
                Number(
                    result.correct || 0
                ),

            wrong:
                Number(
                    result.wrong || 0
                ),

            unattempted:
                Number(
                    result.unattempted || 0
                ),

            score:
                Number(
                    result.score || 0
                ),

            percentage:
                Number(
                    result.percentage || 0
                ),

            // ------------------------------
            // TIME
            // ------------------------------

            timeTaken:
                Number(
                    result.timeTaken || 0
                ),

            duration:
                Number(
                    result.duration || 0
                ),

            // ------------------------------
            // ANSWERS
            // ------------------------------

            userAnswers:
                Array.isArray(
                    result.userAnswers
                )
                ? result.userAnswers
                : [],

            // ------------------------------
            // ANSWER KEY
            // ------------------------------

            answerKey,

            // ------------------------------
            // ORIGINAL QUESTIONS
            // ------------------------------

            questions:
                Array.isArray(
                    result.questions
                )
                ? result.questions
                : [],

            // ------------------------------
            // DATE
            // ------------------------------

            submittedAtISO:
                result.submittedAt
                ||
                new Date().toISOString(),

            submittedAt:
                serverTimestamp(),

            // ------------------------------
            // CREATED
            // ------------------------------

            createdAt:
                serverTimestamp()

        };


        console.log(
            "📦 Firestore Result Data:",
            resultData
        );


        // ==================================
        // SAVE
        // ==================================

        const resultsRef =
            collection(
                db,
                "results"
            );


        const resultDocument =
            await addDoc(
                resultsRef,
                resultData
            );


        console.log(
            "================================"
        );

        console.log(
            "✅ RESULT SAVED"
        );

        console.log(
            "Result Document ID:",
            resultDocument.id
        );

        console.log(
            "================================"
        );


        // ==================================
        // SAVE FIRESTORE RESULT ID LOCALLY
        // ==================================

        localStorage.setItem(
            "savedResultId",
            resultDocument.id
        );


        // ==================================
        // UPDATE LOCAL RESULT
        // ==================================

        result.firestoreResultId =
            resultDocument.id;


        localStorage.setItem(
            "latestResult",
            JSON.stringify(result)
        );


        localStorage.setItem(
            "lastResult",
            JSON.stringify(result)
        );


    }
    catch (error) {

        console.error(
            "================================"
        );

        console.error(
            "❌ FIRESTORE RESULT ERROR"
        );

        console.error(
            error
        );

        console.error(
            "Code:",
            error.code
        );

        console.error(
            "Message:",
            error.message
        );

        console.error(
            "================================"
        );


        // Result page फिर भी दिखेगा.
        // Firestore error के कारण student
        // को result से बाहर नहीं भेजेंगे.

    }

}


// ==========================================
// NAVIGATION
// ==========================================

const dashboardBtn =
    document.getElementById(
        "dashboardBtn"
    );


if (dashboardBtn) {

    dashboardBtn.onclick =
        function () {

            window.location.href =
                "student-dashboard-v2.html";

        };

}


const testsBtn =
    document.getElementById(
        "testsBtn"
    );


if (testsBtn) {

    testsBtn.onclick =
        function () {

            window.location.href =
                "student-tests-v2.html";

        };

}


const resultsBtn =
    document.getElementById(
        "resultsBtn"
    );


if (resultsBtn) {

    resultsBtn.onclick =
        function () {

            window.location.href =
                "my-results-v2.html";

        };

}


// ==========================================
// START
// ==========================================

displayResult();


// IMPORTANT:
// पहले result display होगा,
// फिर Firestore में save होगा.

saveResultToFirestore();