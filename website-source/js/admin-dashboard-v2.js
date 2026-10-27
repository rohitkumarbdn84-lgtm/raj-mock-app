// ==========================================================
// RAJ MOCK TEST V2.0
// ADMIN DASHBOARD
// FIRESTORE + ADMIN CONTROL
// ==========================================================

import { db } from "./firebase.js";

import {
    collection,
    getDocs
} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";


// ==========================================================
// ELEMENTS
// ==========================================================

const examCount =
    document.getElementById("examCount");

const testCount =
    document.getElementById("testCount");

const questionCount =
    document.getElementById("questionCount");

const studentCount =
    document.getElementById("studentCount");

const resultCount =
    document.getElementById("resultCount");

const logoutBtn =
    document.getElementById("logoutBtn");

const refreshBtn =
    document.getElementById("refreshBtn");

const firebaseTitle =
    document.getElementById("firebaseTitle");

const firebaseMessage =
    document.getElementById("firebaseMessage");

const firebaseStatus =
    document.getElementById("firebaseStatus");

const menuBtn =
    document.getElementById("menuBtn");

const sidebar =
    document.getElementById("sidebar");

const sidebarOverlay =
    document.getElementById("sidebarOverlay");


// ==========================================================
// HELPER
// ==========================================================

function setText(element, value) {

    if (element) {

        element.textContent = value;

    }

}


// ==========================================================
// FIREBASE STATUS
// ==========================================================

function setFirebaseStatus(
    connected = true,
    message = ""
) {

    if (!firebaseTitle ||
        !firebaseMessage ||
        !firebaseStatus) {

        return;

    }


    if (connected) {

        firebaseTitle.textContent =
            "🔥 Firebase Connected";

        firebaseMessage.textContent =
            message ||
            "Firestore database is working normally.";

        firebaseStatus.innerHTML =
            `
            <span class="status-dot">●</span>
            Connected
            `;

        firebaseStatus.style.color =
            "#16a34a";

    }
    else {

        firebaseTitle.textContent =
            "⚠️ Firebase Connection Issue";

        firebaseMessage.textContent =
            message ||
            "Unable to load Firestore data.";

        firebaseStatus.innerHTML =
            `
            <span class="status-dot">●</span>
            Error
            `;

        firebaseStatus.style.color =
            "#dc2626";

    }

}


// ==========================================================
// SET LOADING
// ==========================================================

function setLoadingState() {

    setText(examCount, "...");
    setText(testCount, "...");
    setText(questionCount, "...");
    setText(studentCount, "...");
    setText(resultCount, "...");

    setFirebaseStatus(
        true,
        "Loading Firestore data..."
    );

}


// ==========================================================
// LOAD DASHBOARD STATS
// ==========================================================

async function loadDashboardStats() {

    try {

        console.log(
            "📊 Loading dashboard statistics..."
        );


        setLoadingState();


        // ==================================================
        // EXAMS
        // ==================================================

        const examsSnapshot =
            await getDocs(
                collection(
                    db,
                    "exams"
                )
            );


        let exams = 0;


        examsSnapshot.forEach(
            (docSnap) => {

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
                    status !==
                    "inactive"
                ) {

                    exams++;

                }

            }
        );


        // ==================================================
        // TESTS
        // ==================================================

        const testsSnapshot =
            await getDocs(
                collection(
                    db,
                    "tests"
                )
            );


        let tests = 0;


        testsSnapshot.forEach(
            (docSnap) => {

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
                    status !==
                    "inactive"
                ) {

                    tests++;

                }

            }
        );


        // ==================================================
        // QUESTIONS
        // ==================================================

        const questionsSnapshot =
            await getDocs(
                collection(
                    db,
                    "questions"
                )
            );


        const questions =
            questionsSnapshot.size;


        // ==================================================
        // STUDENTS
        // ==================================================

        let students = 0;


        try {

            const studentsSnapshot =
                await getDocs(
                    collection(
                        db,
                        "students"
                    )
                );


            students =
                studentsSnapshot.size;

        }
        catch (studentError) {

            console.warn(
                "⚠️ Students collection unavailable:",
                studentError
            );

            students = 0;

        }


        // ==================================================
        // RESULTS
        // ==================================================

        let results = 0;


        try {

            const resultsSnapshot =
                await getDocs(
                    collection(
                        db,
                        "results"
                    )
                );


            results =
                resultsSnapshot.size;

        }
        catch (resultError) {

            console.warn(
                "⚠️ Results collection unavailable:",
                resultError
            );

            results = 0;

        }


        // ==================================================
        // UPDATE UI
        // ==================================================

        setText(
            examCount,
            exams
        );

        setText(
            testCount,
            tests
        );

        setText(
            questionCount,
            questions
        );

        setText(
            studentCount,
            students
        );

        setText(
            resultCount,
            results
        );


        // ==================================================
        // FIREBASE STATUS
        // ==================================================

        setFirebaseStatus(
            true,
            "Firestore data loaded successfully."
        );


        // ==================================================
        // CONSOLE
        // ==================================================

        console.log(
            "===================================="
        );

        console.log(
            "📊 RAJ MOCK TEST V2.0 DASHBOARD"
        );

        console.log(
            "===================================="
        );

        console.log(
            "🎯 Exams:",
            exams
        );

        console.log(
            "📝 Tests:",
            tests
        );

        console.log(
            "❓ Questions:",
            questions
        );

        console.log(
            "👨‍🎓 Students:",
            students
        );

        console.log(
            "📊 Results:",
            results
        );

        console.log(
            "===================================="
        );


    }
    catch (error) {

        console.error(
            "❌ DASHBOARD ERROR:",
            error
        );


        // ==================================================
        // ERROR VALUES
        // ==================================================

        setText(
            examCount,
            "—"
        );

        setText(
            testCount,
            "—"
        );

        setText(
            questionCount,
            "—"
        );

        setText(
            studentCount,
            "—"
        );

        setText(
            resultCount,
            "—"
        );


        // ==================================================
        // FIREBASE ERROR
        // ==================================================

        let errorMessage =
            "Unable to load Firestore data.";


        if (
            error &&
            error.code ===
            "permission-denied"
        ) {

            errorMessage =
                "Firestore permission denied. Check Firebase rules.";

        }
        else if (
            error &&
            error.message
        ) {

            errorMessage =
                error.message;

        }


        setFirebaseStatus(
            false,
            errorMessage
        );

    }

}


// ==========================================================
// REFRESH DASHBOARD
// ==========================================================

if (refreshBtn) {

    refreshBtn.addEventListener(
        "click",
        async () => {

            try {

                refreshBtn.disabled =
                    true;

                refreshBtn.style.opacity =
                    "0.6";

                refreshBtn.innerHTML =
                    "⏳ <span>Loading...</span>";


                await loadDashboardStats();


            }
            catch (error) {

                console.error(
                    "Refresh error:",
                    error
                );

            }
            finally {

                refreshBtn.disabled =
                    false;

                refreshBtn.style.opacity =
                    "1";

                refreshBtn.innerHTML =
                    "🔄 <span>Refresh</span>";

            }

        }
    );

}


// ==========================================================
// MOBILE SIDEBAR
// ==========================================================

function openSidebar() {

    if (sidebar) {

        sidebar.classList.add(
            "open"
        );

    }


    if (sidebarOverlay) {

        sidebarOverlay.classList.add(
            "active"
        );

    }

}


function closeSidebar() {

    if (sidebar) {

        sidebar.classList.remove(
            "open"
        );

    }


    if (sidebarOverlay) {

        sidebarOverlay.classList.remove(
            "active"
        );

    }

}


if (menuBtn) {

    menuBtn.addEventListener(
        "click",
        () => {

            if (
                sidebar &&
                sidebar.classList.contains(
                    "open"
                )
            ) {

                closeSidebar();

            }
            else {

                openSidebar();

            }

        }
    );

}


if (sidebarOverlay) {

    sidebarOverlay.addEventListener(
        "click",
        () => {

            closeSidebar();

        }
    );

}


// ==========================================================
// CLOSE MOBILE SIDEBAR AFTER NAVIGATION
// ==========================================================

document
    .querySelectorAll(".nav-item")
    .forEach(
        (item) => {

            item.addEventListener(
                "click",
                () => {

                    closeSidebar();

                }
            );

        }
    );


// ==========================================================
// ADMIN LOGOUT
// ==========================================================

if (logoutBtn) {

    logoutBtn.addEventListener(
        "click",
        () => {

            const confirmLogout =
                confirm(
                    "Are you sure you want to logout?"
                );


            if (!confirmLogout) {

                return;

            }


            console.log(
                "🚪 ADMIN LOGOUT"
            );


            // ==================================================
            // CLEAR ADMIN SESSION
            // ==================================================

            localStorage.removeItem(
                "admin"
            );

            localStorage.removeItem(
                "adminLoggedIn"
            );

            localStorage.removeItem(
                "adminName"
            );


            sessionStorage.removeItem(
                "admin"
            );

            sessionStorage.removeItem(
                "adminLoggedIn"
            );

            sessionStorage.removeItem(
                "adminName"
            );


            // ==================================================
            // CLEAR TEMPORARY ADMIN DATA
            // ==================================================

            localStorage.removeItem(
                "selectedExam"
            );

            localStorage.removeItem(
                "selectedExamName"
            );

            localStorage.removeItem(
                "selectedCategory"
            );

            localStorage.removeItem(
                "selectedCategoryName"
            );

            localStorage.removeItem(
                "selectedTest"
            );

            localStorage.removeItem(
                "selectedTestName"
            );

            localStorage.removeItem(
                "selectedTestDuration"
            );

            localStorage.removeItem(
                "selectedTestPlan"
            );


            // ==================================================
            // REDIRECT
            // ==================================================

            window.location.replace(
                "admin-login-v2.html"
            );

        }
    );

}


// ==========================================================
// PAGE VISIBILITY REFRESH
// ==========================================================

document.addEventListener(
    "visibilitychange",
    () => {

        if (
            document.visibilityState ===
            "visible"
        ) {

            console.log(
                "👀 Admin dashboard active"
            );

        }

    }
);


// ==========================================================
// START
// ==========================================================

console.log(
    "🚀 RAJ MOCK TEST V2.0 ADMIN DASHBOARD STARTED"
);


loadDashboardStats();