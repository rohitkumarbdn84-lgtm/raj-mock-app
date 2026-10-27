// ==========================================================
// RAJ MOCK TEST V2.0
// RANK / LEADERBOARD
// FIREBASE RESULTS
// FIXED & IMPROVED VERSION
// ==========================================================

import { db } from "./firebase.js";

import {
    collection,
    getDocs
} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";


// ==========================================================
// ELEMENTS
// ==========================================================

const rankList =
    document.getElementById("rankList");

const myRank =
    document.getElementById("myRank");

const myPercentage =
    document.getElementById("myPercentage");

const backBtn =
    document.getElementById("backBtn");


// ==========================================================
// LOGIN / STUDENT DATA
// ==========================================================

function getCurrentStudent() {

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
        "Student";


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
                studentName !== "Student"
                    ? studentName
                    : (
                        student.name ||
                        student.studentName ||
                        "Student"
                    );

        }
        catch (error) {

            console.warn(
                "⚠️ Student object could not be parsed:",
                error
            );

        }
    }


    return {

        id:
            String(studentId).trim(),

        mobile:
            String(studentMobile).trim(),

        name:
            String(studentName).trim()

    };
}


const currentStudent =
    getCurrentStudent();


// ==========================================================
// LOGIN CHECK
// ==========================================================

function checkLogin() {

    const student =
        localStorage.getItem("student") ||
        sessionStorage.getItem("student");

    const name =
        localStorage.getItem("studentName") ||
        sessionStorage.getItem("studentName");

    const mobile =
        localStorage.getItem("studentMobile") ||
        sessionStorage.getItem("studentMobile");


    if (
        !student &&
        !(name && mobile)
    ) {

        window.location.replace(
            "student-login-v2.html"
        );

        return false;
    }


    return true;
}


// ==========================================================
// NORMALIZE VALUE
// ==========================================================

function clean(value) {

    return String(
        value ?? ""
    ).trim();

}


// ==========================================================
// NUMBER VALUE
// ==========================================================

function numberValue(value) {

    if (
        value === null ||
        value === undefined ||
        value === ""
    ) {
        return 0;
    }


    const number =
        Number(value);


    return Number.isFinite(number)
        ? number
        : 0;
}


// ==========================================================
// GET STUDENT ID FROM RESULT
// ==========================================================

function getResultStudentId(data) {

    return clean(

        data.studentId ||

        data.studentID ||

        data.userId ||

        data.userID ||

        data.uid ||

        data.studentMobile ||

        data.mobile ||

        data.phone ||

        ""

    );
}


// ==========================================================
// GET STUDENT NAME
// ==========================================================

function getResultStudentName(data) {

    return clean(

        data.studentName ||

        data.name ||

        data.student ||

        "Student"

    );
}


// ==========================================================
// GET TOTAL QUESTIONS
// ==========================================================

function getTotalQuestions(data) {

    return numberValue(

        data.totalQuestions ??

        data.total ??

        data.questionCount ??

        data.questions ??

        0

    );
}


// ==========================================================
// GET CORRECT ANSWERS
// ==========================================================

function getCorrectAnswers(data) {

    return numberValue(

        data.correctAnswers ??

        data.correct ??

        data.rightAnswers ??

        data.right ??

        0

    );
}


// ==========================================================
// GET SCORE
// ==========================================================

function getScore(data) {

    return numberValue(

        data.score ??

        data.marks ??

        data.obtainedMarks ??

        data.totalScore ??

        0

    );
}


// ==========================================================
// GET PERCENTAGE
// ==========================================================

function getPercentage(data) {

    let percentage =
        numberValue(

            data.percentage ??

            data.percent ??

            data.percentageScore ??

            0

        );


    // ------------------------------------------------------
    // If percentage is not stored,
    // calculate from correct / total.
    // ------------------------------------------------------

    if (
        percentage <= 0
    ) {

        const total =
            getTotalQuestions(data);

        const correct =
            getCorrectAnswers(data);


        if (
            total > 0 &&
            correct >= 0
        ) {

            percentage =
                (correct / total) * 100;

        }

    }


    // ------------------------------------------------------
    // If still zero but score and total exist
    // ------------------------------------------------------

    if (
        percentage <= 0
    ) {

        const total =
            getTotalQuestions(data);

        const score =
            getScore(data);


        if (
            total > 0 &&
            score > 0
        ) {

            percentage =
                (score / total) * 100;

        }

    }


    // ------------------------------------------------------
    // Keep percentage between 0 and 100
    // ------------------------------------------------------

    return Math.max(
        0,
        Math.min(
            100,
            percentage
        )
    );
}


// ==========================================================
// STUDENT MATCH
// ==========================================================

function isCurrentStudent(id) {

    const resultId =
        clean(id);


    if (!resultId) {
        return false;
    }


    // Match student ID
    if (
        currentStudent.id &&
        resultId === currentStudent.id
    ) {

        return true;

    }


    // Match mobile
    if (
        currentStudent.mobile &&
        resultId === currentStudent.mobile
    ) {

        return true;

    }


    return false;
}


// ==========================================================
// LOAD RANKING
// ==========================================================

async function loadRanking() {

    if (!checkLogin()) {
        return;
    }


    try {

        showLoading();


        console.log(
            "🏆 Loading student ranking..."
        );


        const snapshot =
            await getDocs(

                collection(
                    db,
                    "results"
                )

            );


        const students = {};


        // ==================================================
        // PROCESS FIRESTORE RESULTS
        // ==================================================

        snapshot.forEach(
            docSnap => {

                const data =
                    docSnap.data();


                const studentId =
                    getResultStudentId(data);


                if (!studentId) {
                    return;
                }


                const studentName =
                    getResultStudentName(
                        data
                    );


                const percentage =
                    getPercentage(data);


                const score =
                    getScore(data);


                const total =
                    getTotalQuestions(data);


                const correct =
                    getCorrectAnswers(data);


                // ------------------------------------------------
                // CREATE STUDENT
                // ------------------------------------------------

                if (
                    !students[studentId]
                ) {

                    students[studentId] = {

                        id:
                            studentId,

                        name:
                            studentName,

                        tests:
                            0,

                        totalPercentage:
                            0,

                        totalScore:
                            0,

                        totalQuestions:
                            0,

                        totalCorrect:
                            0

                    };

                }


                const student =
                    students[studentId];


                // ------------------------------------------------
                // ADD RESULT
                // ------------------------------------------------

                student.tests += 1;


                student.totalPercentage +=
                    percentage;


                student.totalScore +=
                    score;


                student.totalQuestions +=
                    total;


                student.totalCorrect +=
                    correct;


                // Keep latest/non-default name
                if (
                    student.name === "Student" &&
                    studentName !== "Student"
                ) {

                    student.name =
                        studentName;

                }

            }
        );


        // ==================================================
        // CONVERT OBJECT TO ARRAY
        // ==================================================

        let ranking =
            Object.values(
                students
            );


        // ==================================================
        // CALCULATE AVERAGE
        // ==================================================

        ranking.forEach(
            student => {

                student.average =

                    student.tests > 0

                        ? (
                            student.totalPercentage /
                            student.tests
                        )

                        : 0;

            }
        );


        // ==================================================
        // SORT RANKING
        // ==================================================

        ranking.sort(
            (a, b) => {

                // 1. Average Percentage
                if (
                    Math.abs(
                        b.average -
                        a.average
                    ) > 0.0001
                ) {

                    return (
                        b.average -
                        a.average
                    );

                }


                // 2. Total Correct
                if (
                    b.totalCorrect !==
                    a.totalCorrect
                ) {

                    return (
                        b.totalCorrect -
                        a.totalCorrect
                    );

                }


                // 3. Total Score
                if (
                    b.totalScore !==
                    a.totalScore
                ) {

                    return (
                        b.totalScore -
                        a.totalScore
                    );

                }


                // 4. Number of Tests
                return (
                    b.tests -
                    a.tests
                );

            }
        );


        // ==================================================
        // ASSIGN RANK
        // ==================================================

        ranking.forEach(
            (student, index) => {

                student.rank =
                    index + 1;

            }
        );


        console.log(
            "🏆 FINAL RANKING:",
            ranking
        );


        // ==================================================
        // CURRENT STUDENT
        // ==================================================

        const current =
            ranking.find(
                student =>
                    isCurrentStudent(
                        student.id
                    )
            );


        if (current) {

            if (myRank) {

                myRank.textContent =
                    "#" +
                    current.rank;

            }


            if (myPercentage) {

                myPercentage.textContent =
                    current.average.toFixed(1) +
                    "%";

            }

        }
        else {

            if (myRank) {

                myRank.textContent =
                    "--";

            }


            if (myPercentage) {

                myPercentage.textContent =
                    "No Result";

            }

        }


        // ==================================================
        // RENDER
        // ==================================================

        renderRanking(
            ranking
        );

    }
    catch (error) {

        console.error(
            "❌ RANKING ERROR:",
            error
        );


        showError(
            error
        );

    }
}


// ==========================================================
// LOADING UI
// ==========================================================

function showLoading() {

    if (!rankList) {
        return;
    }


    rankList.innerHTML = `

        <div class="loading">

            <div class="loader"></div>

            <span>
                Loading ranking...
            </span>

        </div>

    `;
}


// ==========================================================
// ERROR UI
// ==========================================================

function showError(error) {

    if (!rankList) {
        return;
    }


    rankList.innerHTML = `

        <div class="error">

            <div style="font-size:32px;">
                ⚠️
            </div>

            <strong>
                Unable to load ranking
            </strong>

            <small>
                ${escapeHTML(
                    error?.message ||
                    "Unknown error"
                )}
            </small>

            <button
                class="retry-btn"
                id="retryRankBtn"
                type="button"
            >
                Try Again
            </button>

        </div>

    `;


    const retry =
        document.getElementById(
            "retryRankBtn"
        );


    if (retry) {

        retry.addEventListener(
            "click",
            loadRanking
        );

    }
}


// ==========================================================
// RENDER RANKING
// ==========================================================

function renderRanking(
    ranking
) {

    if (!rankList) {
        return;
    }


    if (!ranking.length) {

        rankList.innerHTML = `

            <div class="empty">

                <div style="font-size:38px;">
                    🏆
                </div>

                <br>

                No ranking data available yet.

                <br>

                <small>
                    Attempt a test to appear
                    on the leaderboard.
                </small>

            </div>

        `;

        return;
    }


    rankList.innerHTML = "";


    ranking.forEach(
        student => {

            const row =
                document.createElement(
                    "div"
                );


            row.className =
                "rank-row";


            const isMe =
                isCurrentStudent(
                    student.id
                );


            if (isMe) {

                row.classList.add(
                    "me"
                );

            }


            let medal =
                "";


            if (
                student.rank === 1
            ) {

                medal = "🥇";

            }
            else if (
                student.rank === 2
            ) {

                medal = "🥈";

            }
            else if (
                student.rank === 3
            ) {

                medal = "🥉";

            }


            const position =
                medal ||
                "#" +
                student.rank;


            const testText =
                student.tests === 1
                    ? "1 test"
                    : `${student.tests} tests`;


            row.innerHTML = `

                <div class="position">

                    ${position}

                </div>


                <div class="student-info">

                    <div class="student-name">

                        ${escapeHTML(
                            student.name
                        )}

                        ${
                            isMe
                                ? " ⭐"
                                : ""
                        }

                    </div>


                    <div class="student-tests">

                        ${testText}

                    </div>

                </div>


                <div class="student-correct">

                    ${student.totalCorrect}

                    /

                    ${student.totalQuestions}

                </div>


                <div class="percentage">

                    ${student.average.toFixed(1)}%

                </div>

            `;


            rankList.appendChild(
                row
            );

        }
    );

}


// ==========================================================
// ESCAPE HTML
// ==========================================================

function escapeHTML(
    value
) {

    return String(
        value ?? ""
    )

        .replaceAll(
            "&",
            "&amp;"
        )

        .replaceAll(
            "<",
            "&lt;"
        )

        .replaceAll(
            ">",
            "&gt;"
        )

        .replaceAll(
            '"',
            "&quot;"
        )

        .replaceAll(
            "'",
            "&#039;"
        );

}


// ==========================================================
// BACK BUTTON
// ==========================================================

if (backBtn) {

    backBtn.addEventListener(
        "click",
        () => {

            window.location.href =
                "student-dashboard-v2.html";

        }
    );

}


// ==========================================================
// START
// ==========================================================

console.log(
    "🚀 RAJ MOCK TEST V2.0 RANKING STARTED"
);


loadRanking();