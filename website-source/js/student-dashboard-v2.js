// ==========================================================
// RAJ MOCK TEST V2.0
// STUDENT DASHBOARD
// GOLDEN LIGHT UI
// ==========================================================

import { db } from "./firebase.js";

import {
    collection,
    getDocs,
    query,
    orderBy
} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";


// ==========================================================
// LOGIN PROTECTION
// ==========================================================

function checkStudentLogin() {

    const student =
        localStorage.getItem("student") ||
        sessionStorage.getItem("student");

    const studentName =
        localStorage.getItem("studentName") ||
        sessionStorage.getItem("studentName");

    const studentMobile =
        localStorage.getItem("studentMobile") ||
        sessionStorage.getItem("studentMobile");


    if (student) {
        return true;
    }


    if (studentName && studentMobile) {
        return true;
    }


    console.warn("🔒 Student not logged in");

    window.location.replace(
        "student-login-v2.html"
    );

    return false;
}


if (!checkStudentLogin()) {
    throw new Error("LOGIN_REQUIRED");
}


// ==========================================================
// ELEMENTS
// ==========================================================

const studentNameElement =
    document.getElementById("studentName");

const heroStudentName =
    document.getElementById("heroStudentName");

const profileAvatar =
    document.getElementById("profileAvatar");

const examGrid =
    document.getElementById("examGrid");

const searchExam =
    document.getElementById("searchExam");

const examCount =
    document.getElementById("examCount");

const recentTest =
    document.getElementById("recentTest");

const recentInfo =
    document.getElementById("recentInfo");

const continueBtn =
    document.getElementById("continueBtn");

const statTests =
    document.getElementById("statTests");

const statBest =
    document.getElementById("statBest");

const statAverage =
    document.getElementById("statAverage");

const statPerformance =
    document.getElementById("statPerformance");


// ==========================================================
// STATE
// ==========================================================

let allExams = [];
let allResults = [];


// ==========================================================
// STUDENT DATA
// ==========================================================

function getStudentData() {

    let studentId =
        localStorage.getItem("studentId") ||
        sessionStorage.getItem("studentId") ||
        "";

    let studentMobile =
        localStorage.getItem("studentMobile") ||
        sessionStorage.getItem("studentMobile") ||
        "";

    let studentName =
        localStorage.getItem("studentName") ||
        sessionStorage.getItem("studentName") ||
        "";


    const studentObject =
        localStorage.getItem("student") ||
        sessionStorage.getItem("student");


    if (studentObject) {

        try {

            const student =
                JSON.parse(studentObject);


            studentId =
                studentId ||
                student.id ||
                student.studentId ||
                student.uid ||
                "";


            studentMobile =
                studentMobile ||
                student.mobile ||
                student.phone ||
                "";


            studentName =
                studentName ||
                student.name ||
                student.studentName ||
                "";

        }
        catch (error) {

            console.warn(
                "⚠️ Student object parse error"
            );

        }
    }


    return {

        studentId:
            String(studentId).trim(),

        studentMobile:
            String(studentMobile).trim(),

        studentName:
            String(studentName).trim()

    };
}


// ==========================================================
// LOAD STUDENT NAME
// ==========================================================

function loadStudentName() {

    const student =
        getStudentData();


    const name =
        student.studentName ||
        "Student";


    if (studentNameElement) {
        studentNameElement.textContent = name;
    }


    if (heroStudentName) {
        heroStudentName.textContent = name;
    }


    if (profileAvatar) {

        profileAvatar.textContent =
            name
                .charAt(0)
                .toUpperCase();

    }
}


loadStudentName();


// ==========================================================
// LOAD EXAMS
// ==========================================================

async function loadExams() {

    if (!examGrid) {
        return;
    }


    examGrid.innerHTML = `

        <div class="loading-state">

            <div class="loader"></div>

            <span>
                Loading exams...
            </span>

        </div>

    `;


    try {

        const examsRef =
            collection(
                db,
                "exams"
            );


        let snapshot;


        try {

            const q =
                query(
                    examsRef,
                    orderBy(
                        "order",
                        "asc"
                    )
                );


            snapshot =
                await getDocs(q);

        }
        catch (error) {

            console.warn(
                "⚠️ Ordered exam query failed"
            );


            snapshot =
                await getDocs(
                    examsRef
                );

        }


        allExams = [];


        snapshot.forEach(
            docSnap => {

                const data =
                    docSnap.data();


                const status =
                    String(
                        data.status ||
                        "Publish"
                    )
                    .trim()
                    .toLowerCase();


                if (
                    status === "inactive"
                ) {
                    return;
                }


                allExams.push({

                    id:
                        docSnap.id,

                    name:
                        data.name ||
                        data.title ||
                        "Unnamed Exam",

                    icon:
                        data.icon ||
                        "📚",

                    description:
                        data.description ||
                        "Practice Tests",

                    order:
                        Number(
                            data.order ||
                            999
                        )

                });

            }
        );


        allExams.sort(
            (a, b) =>
                a.order - b.order
        );


        if (examCount) {

            examCount.textContent =
                allExams.length;

        }


        renderExams(
            allExams
        );

    }
    catch (error) {

        console.error(
            "❌ EXAM LOAD ERROR:",
            error
        );


        showExamError(
            error.message
        );

    }
}


// ==========================================================
// RENDER EXAMS
// ==========================================================

function renderExams(exams) {

    if (!examGrid) {
        return;
    }


    examGrid.innerHTML = "";


    if (!exams.length) {

        examGrid.innerHTML = `

            <div class="empty-box">

                <div class="empty-icon">
                    📚
                </div>

                <h3>
                    No Exams Available
                </h3>

                <p>
                    No published exam is available right now.
                </p>

            </div>

        `;

        return;
    }


    exams.forEach(
        exam => {

            const card =
                document.createElement(
                    "div"
                );


            card.className =
                "exam-card";


            card.innerHTML = `

                <div class="exam-icon">
                    ${escapeHTML(exam.icon)}
                </div>

                <h3>
                    ${escapeHTML(exam.name)}
                </h3>

                <p>
                    ${escapeHTML(exam.description)}
                </p>

                <div class="exam-arrow">
                    →
                </div>

            `;


            card.addEventListener(
                "click",
                () => openExam(exam)
            );


            examGrid.appendChild(
                card
            );

        }
    );
}


// ==========================================================
// EXAM ERROR
// ==========================================================

function showExamError(message = "") {

    if (!examGrid) {
        return;
    }


    examGrid.innerHTML = `

        <div class="empty-box">

            <div class="empty-icon">
                ⚠️
            </div>

            <h3>
                Unable to Load Exams
            </h3>

            <p>
                Please refresh the page and try again.
            </p>

        </div>

    `;
}


// ==========================================================
// OPEN EXAM
// ==========================================================

function openExam(exam) {

    localStorage.removeItem("selectedTest");
    localStorage.removeItem("selectedTestName");
    localStorage.removeItem("selectedTestDuration");
    localStorage.removeItem("selectedTestPlan");
    localStorage.removeItem("selectedCategory");
    localStorage.removeItem("selectedCategoryName");


    localStorage.setItem(
        "selectedExam",
        exam.id
    );


    localStorage.setItem(
        "selectedExamName",
        exam.name
    );


    window.location.href =
        "student-tests-v2.html";
}


// ==========================================================
// SEARCH
// ==========================================================

if (searchExam) {

    searchExam.addEventListener(
        "input",
        function () {

            const value =
                this.value
                    .toLowerCase()
                    .trim();


            if (!value) {

                renderExams(
                    allExams
                );

                return;
            }


            const filtered =
                allExams.filter(
                    exam =>

                        exam.name
                            .toLowerCase()
                            .includes(value)

                        ||

                        exam.description
                            .toLowerCase()
                            .includes(value)
                );


            renderExams(
                filtered
            );

        }
    );
}


// ==========================================================
// RESULT TIME
// ==========================================================

function getResultTime(result) {

    if (result.submittedAtISO) {

        const time =
            Date.parse(
                result.submittedAtISO
            );


        if (!isNaN(time)) {
            return time;
        }
    }


    const fields = [
        "submittedAt",
        "createdAt",
        "timestamp",
        "date"
    ];


    for (const field of fields) {

        const value =
            result[field];


        if (!value) {
            continue;
        }


        if (
            typeof value.toMillis ===
            "function"
        ) {

            return value.toMillis();

        }


        if (value.seconds) {

            return (
                Number(value.seconds) *
                1000
            );

        }


        const parsed =
            Date.parse(value);


        if (!isNaN(parsed)) {
            return parsed;
        }
    }


    return 0;
}


// ==========================================================
// DATE
// ==========================================================

function formatDate(result) {

    const time =
        getResultTime(result);


    if (!time) {
        return "";
    }


    return new Date(time)
        .toLocaleDateString(
            "en-IN",
            {
                day: "2-digit",
                month: "short",
                year: "numeric"
            }
        );
}


// ==========================================================
// LOAD RESULTS
// ==========================================================

async function loadResults() {

    try {

        const student =
            getStudentData();


        if (
            !student.studentId &&
            !student.studentMobile
        ) {

            showNoResults();

            return;
        }


        const resultsRef =
            collection(
                db,
                "results"
            );


        const snapshot =
            await getDocs(
                resultsRef
            );


        allResults = [];


        snapshot.forEach(
            docSnap => {

                const data =
                    docSnap.data();


                const resultStudentId =
                    String(
                        data.studentId ||
                        data.studentID ||
                        data.userId ||
                        ""
                    ).trim();


                const resultMobile =
                    String(
                        data.studentMobile ||
                        data.mobile ||
                        data.phone ||
                        ""
                    ).trim();


                const idMatch =
                    student.studentId &&
                    resultStudentId &&
                    student.studentId ===
                    resultStudentId;


                const mobileMatch =
                    student.studentMobile &&
                    resultMobile &&
                    student.studentMobile ===
                    resultMobile;


                if (
                    idMatch ||
                    mobileMatch
                ) {

                    allResults.push({

                        id:
                            docSnap.id,

                        ...data

                    });

                }

            }
        );


        allResults.sort(
            (a, b) =>
                getResultTime(b) -
                getResultTime(a)
        );


        updateStatistics();
        updateRecentTest();

    }
    catch (error) {

        console.error(
            "❌ RESULTS LOAD ERROR:",
            error
        );

        showNoResults();

    }
}


// ==========================================================
// PERCENTAGE
// ==========================================================

function getPercentage(result) {

    let percentage =
        Number(
            result.percentage ??
            result.percent ??
            0
        );


    if (!percentage) {

        const total =
            Number(
                result.total ??
                result.totalQuestions ??
                0
            );


        const correct =
            Number(
                result.correct ??
                result.correctAnswers ??
                0
            );


        if (total > 0) {

            percentage =
                (correct / total) * 100;

        }
    }


    return percentage;
}


// ==========================================================
// STATISTICS
// ==========================================================

function updateStatistics() {

    if (!allResults.length) {

        showNoResults();

        return;
    }


    const percentages =
        allResults.map(
            result =>
                getPercentage(result)
        );


    const best =
        Math.max(
            ...percentages
        );


    const average =
        percentages.reduce(
            (sum, value) =>
                sum + value,
            0
        ) / percentages.length;


    if (statTests) {

        statTests.textContent =
            allResults.length;

    }


    if (statBest) {

        statBest.textContent =
            `${best.toFixed(0)}%`;

    }


    if (statAverage) {

        statAverage.textContent =
            `${average.toFixed(0)}%`;

    }


    if (statPerformance) {

        if (average >= 80) {

            statPerformance.textContent =
                "Excellent";

        }
        else if (average >= 60) {

            statPerformance.textContent =
                "Good";

        }
        else if (average >= 40) {

            statPerformance.textContent =
                "Improve";

        }
        else {

            statPerformance.textContent =
                "Practice";

        }

    }
}


// ==========================================================
// RECENT TEST
// ==========================================================

function updateRecentTest() {

    if (!allResults.length) {

        showNoResults();

        return;
    }


    const latest =
        allResults[0];


    const testName =
        latest.testName ||
        latest.testTitle ||
        latest.test ||
        latest.name ||
        "Mock Test";


    const category =
        latest.categoryName ||
        latest.category ||
        "";


    const total =
        Number(
            latest.total ??
            latest.totalQuestions ??
            latest.questionCount ??
            0
        );


    const correct =
        Number(
            latest.correct ??
            latest.correctAnswers ??
            0
        );


    const percentage =
        getPercentage(latest);


    const date =
        formatDate(latest);


    if (recentTest) {

        recentTest.textContent =
            testName;

    }


    if (recentInfo) {

        let text =
            `Score: ${correct}/${total} • ${percentage.toFixed(1)}%`;


        if (category) {
            text += ` • ${category}`;
        }


        if (date) {
            text += ` • ${date}`;
        }


        recentInfo.textContent =
            text;

    }


    if (continueBtn) {

        continueBtn.style.display =
            "inline-flex";


        continueBtn.innerHTML = `
            View Result
            <span>→</span>
        `;


        continueBtn.onclick =
            function () {

                localStorage.setItem(
                    "selectedResultId",
                    latest.id
                );


                localStorage.setItem(
                    "latestResultId",
                    latest.id
                );


                window.location.href =
                    "my-results-v2.html";

            };

    }
}


// ==========================================================
// NO RESULTS
// ==========================================================

function showNoResults() {

    if (recentTest) {

        recentTest.textContent =
            "No test attempted yet";

    }


    if (recentInfo) {

        recentInfo.textContent =
            "Start your first test to see your progress here.";

    }


    if (continueBtn) {

        continueBtn.style.display =
            "none";

    }


    if (statTests)
        statTests.textContent = "0";


    if (statBest)
        statBest.textContent = "0%";


    if (statAverage)
        statAverage.textContent = "0%";


    if (statPerformance)
        statPerformance.textContent = "Start";
}


// ==========================================================
// HERO TESTS
// ==========================================================

document
    .getElementById("heroTestsBtn")
    ?.addEventListener(
        "click",
        () => {

            const selectedExam =
                localStorage.getItem(
                    "selectedExam"
                );


            if (selectedExam) {

                window.location.href =
                    "student-tests-v2.html";

            }
            else {

                document
                    .getElementById("examGrid")
                    ?.scrollIntoView({
                        behavior: "smooth"
                    });

            }

        }
    );


// ==========================================================
// RESULTS BUTTONS
// ==========================================================

function openResults() {

    window.location.href =
        "my-results-v2.html";
}


document
    .getElementById("heroResultsBtn")
    ?.addEventListener(
        "click",
        openResults
    );


document
    .getElementById("resultsBtn")
    ?.addEventListener(
        "click",
        openResults
    );


document
    .getElementById("resultsNavBtn")
    ?.addEventListener(
        "click",
        openResults
    );


// ==========================================================
// SUBSCRIPTION
// ==========================================================

document
    .getElementById("subscriptionBtn")
    ?.addEventListener(
        "click",
        () => {

            window.location.href =
                "subscription.html";

        }
    );


// ==========================================================
// HOME
// ==========================================================

document
    .getElementById("homeNavBtn")
    ?.addEventListener(
        "click",
        () => {

            window.location.href =
                "student-dashboard-v2.html";

        }
    );


// ==========================================================
// TESTS
// ==========================================================

document
    .getElementById("testsBtn")
    ?.addEventListener(
        "click",
        () => {

            const selectedExam =
                localStorage.getItem(
                    "selectedExam"
                );


            if (selectedExam) {

                window.location.href =
                    "student-tests-v2.html";

            }
            else {

                document
                    .getElementById("examGrid")
                    ?.scrollIntoView({
                        behavior: "smooth"
                    });

            }

        }
    );


// ==========================================================
// RANK
// ==========================================================

document
    .getElementById("rankNavBtn")
    ?.addEventListener(
        "click",
        () => {

            window.location.href =
                "rank-v2.html";

        }
    );


// ==========================================================
// PROFILE
// ==========================================================

document
    .getElementById("profileNavBtn")
    ?.addEventListener(
        "click",
        () => {

            window.location.href =
                "profile-v2.html";

        }
    );


// ==========================================================
// NOTIFICATION
// ==========================================================

document
    .getElementById("notificationBtn")
    ?.addEventListener(
        "click",
        () => {

            alert(
                "🔔 No new notifications"
            );

        }
    );


// ==========================================================
// LOGOUT
// ==========================================================

document
    .getElementById("logoutBtn")
    ?.addEventListener(
        "click",
        () => {

            const confirmLogout =
                confirm(
                    "Are you sure you want to logout?"
                );


            if (!confirmLogout) {
                return;
            }


            const localKeys = [

                "studentId",
                "studentName",
                "studentMobile",
                "student",

                "selectedExam",
                "selectedExamName",

                "selectedTest",
                "selectedTestName",
                "selectedTestDuration",
                "selectedTestPlan",

                "selectedCategory",
                "selectedCategoryName"

            ];


            localKeys.forEach(
                key =>
                    localStorage.removeItem(key)
            );


            localKeys.forEach(
                key =>
                    sessionStorage.removeItem(key)
            );


            window.location.replace(
                "student-login-v2.html"
            );

        }
    );


// ==========================================================
// HTML SAFETY
// ==========================================================

function escapeHTML(value) {

    return String(
        value ?? ""
    )

        .replaceAll("&", "&amp;")
        .replaceAll("<", "&lt;")
        .replaceAll(">", "&gt;")
        .replaceAll('"', "&quot;")
        .replaceAll("'", "&#039;");
}


// ==========================================================
// START
// ==========================================================

console.log(
    "🚀 RAJ MOCK TEST V2.0 GOLDEN DASHBOARD STARTED"
);


loadExams();
loadResults();