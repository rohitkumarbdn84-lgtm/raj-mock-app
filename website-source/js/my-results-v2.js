// ==========================================================
// RAJ MOCK TEST V2.0
// MY RESULTS
// FIRESTORE - STUDENT RESULTS
// DUPLICATE SAFE VERSION
// ANSWER KEY - ROBUST
// ==========================================================

import { db } from "./firebase.js";

import {
    collection,
    query,
    where,
    getDocs
} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";


// ==========================================================
// ELEMENTS
// ==========================================================

const studentNameElement =
    document.getElementById("studentName");

const studentAvatarElement =
    document.getElementById("studentAvatar");

const resultsGrid =
    document.getElementById("resultsGrid");

const totalTestsElement =
    document.getElementById("totalTests");

const bestScoreElement =
    document.getElementById("bestScore");

const averageScoreElement =
    document.getElementById("averageScore");

const resultCountElement =
    document.getElementById("resultCount");

const searchResults =
    document.getElementById("searchResults");

const answerModal =
    document.getElementById("answerModal");

const closeModalBtn =
    document.getElementById("closeModalBtn");

const answerKeyContainer =
    document.getElementById("answerKeyContainer");

const modalTestName =
    document.getElementById("modalTestName");

const modalTestInfo =
    document.getElementById("modalTestInfo");

const backBtn =
    document.getElementById("backBtn");


// ==========================================================
// STATE
// ==========================================================

let allResults = [];


// ==========================================================
// STUDENT ID
// ==========================================================

function getStudentId() {

    const id =
        localStorage.getItem("studentId") ||
        sessionStorage.getItem("studentId") ||
        localStorage.getItem("studentMobile") ||
        sessionStorage.getItem("studentMobile");

    return id
        ? String(id).trim()
        : "";

}


// ==========================================================
// LOAD STUDENT
// ==========================================================

function loadStudent() {

    const name =
        localStorage.getItem("studentName") ||
        sessionStorage.getItem("studentName") ||
        "Student";


    if (studentNameElement) {

        studentNameElement.textContent =
            name;

    }


    if (studentAvatarElement) {

        studentAvatarElement.textContent =
            name.charAt(0).toUpperCase();

    }

}


// ==========================================================
// LOADING
// ==========================================================

function showLoading() {

    if (!resultsGrid) return;


    resultsGrid.innerHTML = `

        <div class="loading-box">

            <div class="loader"></div>

            <p>
                Loading your results...
            </p>

        </div>

    `;

}


// ==========================================================
// LOGIN REQUIRED
// ==========================================================

function showLoginRequired() {

    if (!resultsGrid) return;


    resultsGrid.innerHTML = `

        <div class="empty-box">

            <div class="empty-icon">
                🔐
            </div>

            <h3>
                Student Login Required
            </h3>

            <p>
                Please login to view your results.
            </p>

        </div>

    `;

}


// ==========================================================
// LOAD RESULTS
// ==========================================================

async function loadResults() {

    showLoading();


    const studentId =
        getStudentId();


    console.log(
        "👤 Student ID:",
        studentId
    );


    if (!studentId) {

        showLoginRequired();

        return;

    }


    try {

        const resultsRef =
            collection(
                db,
                "results"
            );


        // ==================================================
        // ONLY ONE QUERY
        // ==================================================

        const resultsQuery =
            query(
                resultsRef,
                where(
                    "studentId",
                    "==",
                    studentId
                )
            );


        const snapshot =
            await getDocs(
                resultsQuery
            );


        const loadedResults = [];


        snapshot.forEach(
            docSnap => {

                const data =
                    docSnap.data();


                const testId =
                    data.testId ??
                    data.testID ??
                    data.test_id ??
                    data.testRef ??
                    data.testRefId ??
                    "";


                loadedResults.push({

                    id:
                        docSnap.id,

                    studentId:
                        String(
                            data.studentId || ""
                        ).trim(),

                    studentName:
                        data.studentName ||
                        "Student",

                    testId:
                        String(
                            testId
                        ).trim(),

                    testName:
                        data.testName ||
                        data.testTitle ||
                        data.name ||
                        "Mock Test",

                    categoryId:
                        data.categoryId ||
                        "",

                    categoryName:
                        data.categoryName ||
                        data.category ||
                        "Category",

                    total:
                        Number(
                            data.total ??
                            data.totalQuestions ??
                            data.questionCount ??
                            0
                        ),

                    correct:
                        Number(
                            data.correct ??
                            data.correctAnswers ??
                            0
                        ),

                    wrong:
                        Number(
                            data.wrong ??
                            data.wrongAnswers ??
                            0
                        ),

                    unattempted:
                        Number(
                            data.unattempted ??
                            data.notAttempted ??
                            0
                        ),

                    score:
                        Number(
                            data.score ??
                            0
                        ),

                    percentage:
                        Number(
                            data.percentage ??
                            data.percent ??
                            0
                        ),

                    timeTaken:
                        Number(
                            data.timeTaken ??
                            data.time ??
                            0
                        ),

                    duration:
                        Number(
                            data.duration ??
                            0
                        ),

                    userAnswers:
                        getUserAnswers(data),

                    submittedAtISO:
                        getSubmittedDate(data)

                });

            }
        );


        console.log(
            "📦 Raw results:",
            loadedResults
        );


        // ==================================================
        // REMOVE DUPLICATES
        // ==================================================

        allResults =
            removeDuplicateResults(
                loadedResults
            );


        // ==================================================
        // SORT NEWEST FIRST
        // ==================================================

        allResults.sort(
            (a, b) => {

                const dateA =
                    getDateTime(
                        a.submittedAtISO
                    );

                const dateB =
                    getDateTime(
                        b.submittedAtISO
                    );


                return dateB - dateA;

            }
        );


        console.log(
            "✅ FINAL UNIQUE RESULTS:",
            allResults
        );


        updateSummary(
            allResults
        );


        renderResults(
            allResults
        );

    }
    catch (error) {

        console.error(
            "❌ RESULT LOAD ERROR:",
            error
        );


        if (resultsGrid) {

            resultsGrid.innerHTML = `

                <div class="empty-box">

                    <div class="empty-icon">
                        ⚠️
                    </div>

                    <h3>
                        Unable to Load Results
                    </h3>

                    <p>
                        ${escapeHTML(
                            error.message ||
                            "Please try again later."
                        )}
                    </p>

                </div>

            `;

        }

    }

}


// ==========================================================
// REMOVE DUPLICATE RESULTS
// ==========================================================
//
// Same student + same test
// → latest result is displayed.
//
// If testId is missing, document ID is used,
// so unrelated results are not accidentally removed.
// ==========================================================

function removeDuplicateResults(results) {

    const resultMap =
        new Map();


    results.forEach(
        result => {

            const testId =
                String(
                    result.testId || ""
                ).trim();


            // ------------------------------------------------
            // If test ID exists
            // ------------------------------------------------

            if (testId) {

                const key =
                    `TEST_${testId}`;


                const existing =
                    resultMap.get(key);


                if (!existing) {

                    resultMap.set(
                        key,
                        result
                    );

                    return;

                }


                const existingDate =
                    getDateTime(
                        existing.submittedAtISO
                    );


                const currentDate =
                    getDateTime(
                        result.submittedAtISO
                    );


                // Keep newest result
                if (
                    currentDate >=
                    existingDate
                ) {

                    resultMap.set(
                        key,
                        result
                    );

                }


                return;

            }


            // ------------------------------------------------
            // No test ID
            // ------------------------------------------------

            resultMap.set(
                `DOC_${result.id}`,
                result
            );

        }
    );


    const uniqueResults =
        Array.from(
            resultMap.values()
        );


    console.log(
        `🧹 Duplicate cleanup: ${results.length} → ${uniqueResults.length}`
    );


    return uniqueResults;

}


// ==========================================================
// DATE → TIMESTAMP
// ==========================================================

function getDateTime(value) {

    if (!value) {

        return 0;

    }


    try {

        if (
            value &&
            typeof value.toDate === "function"
        ) {

            return value
                .toDate()
                .getTime();

        }


        const date =
            new Date(value);


        const time =
            date.getTime();


        return Number.isNaN(time)
            ? 0
            : time;

    }
    catch {

        return 0;

    }

}


// ==========================================================
// USER ANSWERS
// ==========================================================

function getUserAnswers(data) {

    const answers =
        data.userAnswers ??
        data.answers ??
        data.selectedAnswers ??
        data.studentAnswers ??
        [];


    if (Array.isArray(answers)) {

        return answers;

    }


    if (
        answers &&
        typeof answers === "object"
    ) {

        return Object.values(
            answers
        );

    }


    return [];

}


// ==========================================================
// SUBMITTED DATE
// ==========================================================

function getSubmittedDate(data) {

    const value =
        data.submittedAtISO ??
        data.submittedAt ??
        data.createdAt ??
        "";


    if (
        value &&
        typeof value.toDate === "function"
    ) {

        return value
            .toDate()
            .toISOString();

    }


    return value;

}


// ==========================================================
// SUMMARY
// ==========================================================

function updateSummary(results) {

    const count =
        results.length;


    if (totalTestsElement) {

        totalTestsElement.textContent =
            count;

    }


    if (resultCountElement) {

        resultCountElement.textContent =
            `${count} Result${count === 1 ? "" : "s"}`;

    }


    if (count === 0) {

        if (bestScoreElement) {

            bestScoreElement.textContent =
                "0%";

        }


        if (averageScoreElement) {

            averageScoreElement.textContent =
                "0%";

        }


        return;

    }


    const percentages =
        results.map(
            result =>
                Number(
                    result.percentage || 0
                )
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
        ) / count;


    if (bestScoreElement) {

        bestScoreElement.textContent =
            `${Math.round(best)}%`;

    }


    if (averageScoreElement) {

        averageScoreElement.textContent =
            `${Math.round(average)}%`;

    }

}


// ==========================================================
// RENDER RESULTS
// ==========================================================

function renderResults(results) {

    if (!resultsGrid) return;


    resultsGrid.innerHTML = "";


    if (resultCountElement) {

        resultCountElement.textContent =
            `${results.length} Result${results.length === 1 ? "" : "s"}`;

    }


    if (results.length === 0) {

        resultsGrid.innerHTML = `

            <div class="empty-box">

                <div class="empty-icon">
                    📚
                </div>

                <h3>
                    No Results Yet
                </h3>

                <p>
                    Your completed tests will appear here.
                </p>

            </div>

        `;

        return;

    }


    results.forEach(
        result => {

            const card =
                document.createElement(
                    "div"
                );


            card.className =
                "result-card";


            const percentage =
                Number(
                    result.percentage || 0
                );


            const date =
                formatDate(
                    result.submittedAtISO
                );


            card.innerHTML = `

                <div class="result-top">

                    <div>

                        <div class="result-title">

                            ${escapeHTML(
                                result.testName
                            )}

                        </div>


                        <div class="result-category">

                            📂
                            ${escapeHTML(
                                result.categoryName
                            )}

                        </div>

                    </div>


                    <div class="score-badge">

                        <strong>
                            ${percentage}%
                        </strong>

                        <span>
                            Score
                        </span>

                    </div>

                </div>


                <div class="result-info">

                    <div class="info-item">

                        <span>
                            Correct
                        </span>

                        <strong>
                            ${result.correct}
                        </strong>

                    </div>


                    <div class="info-item">

                        <span>
                            Wrong
                        </span>

                        <strong>
                            ${result.wrong}
                        </strong>

                    </div>


                    <div class="info-item">

                        <span>
                            Unattempted
                        </span>

                        <strong>
                            ${result.unattempted}
                        </strong>

                    </div>


                    <div class="info-item">

                        <span>
                            Total
                        </span>

                        <strong>
                            ${result.total}
                        </strong>

                    </div>


                    <div class="info-item">

                        <span>
                            Time
                        </span>

                        <strong>
                            ${formatTime(
                                result.timeTaken
                            )}
                        </strong>

                    </div>


                    <div class="info-item">

                        <span>
                            Date
                        </span>

                        <strong>
                            ${escapeHTML(
                                date
                            )}
                        </strong>

                    </div>

                </div>


                <div class="result-actions">

                    <button
                        type="button"
                        class="view-btn">

                        📊 View Result

                    </button>


                    <button
                        type="button"
                        class="answer-btn">

                        📝 Answer Key

                    </button>

                </div>

            `;


            const viewButton =
                card.querySelector(
                    ".view-btn"
                );


            const answerButton =
                card.querySelector(
                    ".answer-btn"
                );


            if (viewButton) {

                viewButton.onclick =
                    () =>
                        showResultDetails(
                            result
                        );

            }


            if (answerButton) {

                answerButton.onclick =
                    () =>
                        openAnswerKey(
                            result
                        );

            }


            resultsGrid.appendChild(
                card
            );

        }
    );

}


// ==========================================================
// VIEW RESULT
// ==========================================================

function showResultDetails(result) {

    alert(

        `📊 ${result.testName}\n\n` +

        `Score: ${result.correct}/${result.total}\n` +

        `Percentage: ${result.percentage}%\n` +

        `Correct: ${result.correct}\n` +

        `Wrong: ${result.wrong}\n` +

        `Unattempted: ${result.unattempted}\n` +

        `Time: ${formatTime(
            result.timeTaken
        )}`

    );

}


// ==========================================================
// ANSWER KEY
// ==========================================================

async function openAnswerKey(result) {

    console.log(
        "📝 OPEN ANSWER KEY:",
        result
    );


    if (!answerModal) {

        console.error(
            "❌ answerModal not found"
        );

        return;

    }


    answerModal.classList.add(
        "show"
    );


    if (modalTestName) {

        modalTestName.textContent =
            result.testName ||
            "Answer Key";

    }


    if (modalTestInfo) {

        modalTestInfo.textContent =
            `${result.correct}/${result.total} Correct • ${result.percentage}%`;

    }


    if (answerKeyContainer) {

        answerKeyContainer.innerHTML = `

            <div class="loading-box">

                <div class="loader"></div>

                <p>
                    Loading Answer Key...
                </p>

            </div>

        `;

    }


    try {

        const testId =
            String(
                result.testId || ""
            ).trim();


        if (!testId) {

            showAnswerKeyError(
                "Test ID Missing",
                "This result does not contain a valid test ID."
            );

            return;

        }


        const questionsRef =
            collection(
                db,
                "questions"
            );


        let snapshot = null;


        // ==================================================
        // 1. testId
        // ==================================================

        snapshot =
            await getDocs(
                query(
                    questionsRef,
                    where(
                        "testId",
                        "==",
                        testId
                    )
                )
            );


        // ==================================================
        // 2. testID
        // ==================================================

        if (snapshot.empty) {

            snapshot =
                await getDocs(
                    query(
                        questionsRef,
                        where(
                            "testID",
                            "==",
                            testId
                        )
                    )
                );

        }


        // ==================================================
        // 3. test_id
        // ==================================================

        if (snapshot.empty) {

            snapshot =
                await getDocs(
                    query(
                        questionsRef,
                        where(
                            "test_id",
                            "==",
                            testId
                        )
                    )
                );

        }


        const questions = [];


        snapshot.forEach(
            docSnap => {

                const data =
                    docSnap.data();


                const options =
                    getQuestionOptions(
                        data
                    );


                const correctRaw =
                    data.answer ??
                    data.correctAnswer ??
                    data.correctOption ??
                    data.correct ??
                    data.correct_option ??
                    "";


                questions.push({

                    id:
                        docSnap.id,

                    question:
                        data.question ??
                        data.questionText ??
                        data.text ??
                        "",

                    A:
                        options.A,

                    B:
                        options.B,

                    C:
                        options.C,

                    D:
                        options.D,

                    answer:
                        normalizeCorrectAnswer(
                            correctRaw
                        ),

                    order:
                        getQuestionOrder(
                            data
                        ),

                    raw:
                        data

                });

            }
        );


        questions.sort(
            (a, b) =>
                a.order - b.order
        );


        if (
            questions.length === 0
        ) {

            showAnswerKeyError(
                "Answer Key Not Available",
                "No questions were found for this test.",
                testId
            );

            return;

        }


        const studentAnswers =
            Array.isArray(
                result.userAnswers
            )
                ? result.userAnswers
                : [];


        answerKeyContainer.innerHTML =
            "";


        questions.forEach(
            (
                question,
                index
            ) => {

                const rawStudentAnswer =
                    getStudentAnswer(
                        studentAnswers,
                        question,
                        index
                    );


                const studentAnswer =
                    normalizeStudentAnswer(
                        rawStudentAnswer
                    );


                const correctAnswer =
                    question.answer;


                const status =
                    getQuestionStatus(
                        studentAnswer,
                        correctAnswer
                    );


                const card =
                    document.createElement(
                        "div"
                    );


                card.className =
                    "answer-card";


                card.innerHTML = `

                    <div class="answer-question">

                        <strong>
                            Q${index + 1}.
                        </strong>

                        ${escapeHTML(
                            question.question
                        )}

                        <span
                            class="question-status ${status.className}">

                            ${status.text}

                        </span>

                    </div>


                    <div class="answer-options">

                        ${createOption(
                            "A",
                            question.A,
                            correctAnswer,
                            studentAnswer
                        )}

                        ${createOption(
                            "B",
                            question.B,
                            correctAnswer,
                            studentAnswer
                        )}

                        ${createOption(
                            "C",
                            question.C,
                            correctAnswer,
                            studentAnswer
                        )}

                        ${createOption(
                            "D",
                            question.D,
                            correctAnswer,
                            studentAnswer
                        )}

                    </div>

                `;


                answerKeyContainer.appendChild(
                    card
                );

            }
        );

    }
    catch (error) {

        console.error(
            "❌ ANSWER KEY ERROR:",
            error
        );


        showAnswerKeyError(
            "Unable to Load Answer Key",
            error.message ||
            "Unknown error"
        );

    }

}


// ==========================================================
// ANSWER KEY ERROR
// ==========================================================

function showAnswerKeyError(
    title,
    message,
    testId = ""
) {

    if (!answerKeyContainer) return;


    answerKeyContainer.innerHTML = `

        <div class="empty-box">

            <div class="empty-icon">
                ⚠️
            </div>

            <h3>
                ${escapeHTML(
                    title
                )}
            </h3>

            <p>
                ${escapeHTML(
                    message
                )}
            </p>

            ${
                testId
                    ? `
                        <small>
                            Test ID:
                            ${escapeHTML(
                                testId
                            )}
                        </small>
                    `
                    : ""
            }

        </div>

    `;

}


// ==========================================================
// QUESTION OPTIONS
// ==========================================================

function getQuestionOptions(data) {

    let A =
        data.A ??
        data.a ??
        "";

    let B =
        data.B ??
        data.b ??
        "";

    let C =
        data.C ??
        data.c ??
        "";

    let D =
        data.D ??
        data.d ??
        "";


    // ------------------------------------------------------
    // OPTIONS ARRAY
    // ------------------------------------------------------

    if (
        Array.isArray(
            data.options
        )
    ) {

        A =
            data.options[0] ??
            A;

        B =
            data.options[1] ??
            B;

        C =
            data.options[2] ??
            C;

        D =
            data.options[3] ??
            D;

    }


    // ------------------------------------------------------
    // OPTIONS OBJECT
    // ------------------------------------------------------

    if (
        data.options &&
        typeof data.options === "object" &&
        !Array.isArray(
            data.options
        )
    ) {

        A =
            data.options.A ??
            data.options.a ??
            A;

        B =
            data.options.B ??
            data.options.b ??
            B;

        C =
            data.options.C ??
            data.options.c ??
            C;

        D =
            data.options.D ??
            data.options.d ??
            D;

    }


    return {

        A:
            String(
                A ?? ""
            ),

        B:
            String(
                B ?? ""
            ),

        C:
            String(
                C ?? ""
            ),

        D:
            String(
                D ?? ""
            )

    };

}


// ==========================================================
// QUESTION ORDER
// ==========================================================

function getQuestionOrder(data) {

    const value =
        data.order ??
        data.questionNo ??
        data.questionNumber ??
        data.index ??
        data.serialNo;


    if (
        value === undefined ||
        value === null ||
        value === ""
    ) {

        return 999999;

    }


    const number =
        Number(value);


    return Number.isFinite(
        number
    )
        ? number
        : 999999;

}


// ==========================================================
// GET STUDENT ANSWER
// ==========================================================

function getStudentAnswer(
    studentAnswers,
    question,
    index
) {

    if (
        !Array.isArray(
            studentAnswers
        )
    ) {

        return null;

    }


    // ------------------------------------------------------
    // MATCH QUESTION ID
    // ------------------------------------------------------

    for (
        const item of studentAnswers
    ) {

        if (
            item &&
            typeof item === "object"
        ) {

            const questionId =
                item.questionId ??
                item.questionID ??
                item.question_id ??
                item.id ??
                item.qid;


            if (
                questionId &&
                String(
                    questionId
                ).trim() ===
                String(
                    question.id
                ).trim()
            ) {

                return extractAnswerValue(
                    item
                );

            }

        }

    }


    // ------------------------------------------------------
    // ARRAY INDEX
    // ------------------------------------------------------

    const item =
        studentAnswers[index];


    if (
        item &&
        typeof item === "object"
    ) {

        return extractAnswerValue(
            item
        );

    }


    return item ?? null;

}


// ==========================================================
// EXTRACT ANSWER
// ==========================================================

function extractAnswerValue(item) {

    if (
        !item ||
        typeof item !== "object"
    ) {

        return item;

    }


    return (
        item.answer ??
        item.selectedAnswer ??
        item.userAnswer ??
        item.selectedOption ??
        item.option ??
        item.value ??
        item.choice ??
        null
    );

}


// ==========================================================
// STATUS
// ==========================================================

function getQuestionStatus(
    studentAnswer,
    correctAnswer
) {

    if (
        studentAnswer === null ||
        studentAnswer === undefined ||
        studentAnswer === -1
    ) {

        return {

            className:
                "status-unattempted",

            text:
                "⭕ Not Attempted"

        };

    }


    if (
        correctAnswer === -1
    ) {

        return {

            className:
                "status-unattempted",

            text:
                "⚠️ Answer Missing"

        };

    }


    if (
        studentAnswer ===
        correctAnswer
    ) {

        return {

            className:
                "status-correct",

            text:
                "✅ Correct"

        };

    }


    return {

        className:
            "status-wrong",

        text:
            "❌ Wrong"

    };

}


// ==========================================================
// CREATE OPTION
// ==========================================================

function createOption(
    letter,
    text,
    correctAnswer,
    studentAnswer
) {

    const index =
        letterToIndex(
            letter
        );


    const isCorrect =
        index === correctAnswer;


    const isStudentAnswer =
        studentAnswer !== null &&
        studentAnswer !== undefined &&
        studentAnswer !== -1 &&
        index === studentAnswer;


    let classes =
        "answer-option";


    let badges = "";


    if (isCorrect) {

        classes +=
            " correct-option";


        badges += `

            <span class="correct-label">

                ✅ Correct Answer

            </span>

        `;

    }


    if (
        isStudentAnswer &&
        !isCorrect
    ) {

        classes +=
            " wrong-option";


        badges += `

            <span class="wrong-label">

                ❌ Your Answer

            </span>

        `;

    }


    if (
        isStudentAnswer &&
        isCorrect
    ) {

        classes +=
            " student-correct-option";


        badges += `

            <span class="correct-label">

                👤 Your Answer

            </span>

        `;

    }


    return `

        <div class="${classes}">

            <strong>
                ${letter}.
            </strong>

            <span class="option-content">

                ${escapeHTML(
                    text
                )}

            </span>

            ${badges}

        </div>

    `;

}


// ==========================================================
// NORMALIZE CORRECT ANSWER
// ==========================================================

function normalizeCorrectAnswer(answer) {

    if (
        answer === null ||
        answer === undefined ||
        answer === ""
    ) {

        return -1;

    }


    if (
        typeof answer === "number"
    ) {

        if (
            answer >= 0 &&
            answer <= 3
        ) {

            return answer;

        }


        if (
            answer >= 1 &&
            answer <= 4
        ) {

            return answer - 1;

        }

    }


    if (
        typeof answer === "string"
    ) {

        const value =
            answer
                .trim()
                .toUpperCase();


        if (
            value === "A" ||
            value.startsWith("A.") ||
            value.startsWith("A)")
        ) return 0;


        if (
            value === "B" ||
            value.startsWith("B.") ||
            value.startsWith("B)")
        ) return 1;


        if (
            value === "C" ||
            value.startsWith("C.") ||
            value.startsWith("C)")
        ) return 2;


        if (
            value === "D" ||
            value.startsWith("D.") ||
            value.startsWith("D)")
        ) return 3;


        if (
            value.includes(
                "OPTION A"
            )
        ) return 0;


        if (
            value.includes(
                "OPTION B"
            )
        ) return 1;


        if (
            value.includes(
                "OPTION C"
            )
        ) return 2;


        if (
            value.includes(
                "OPTION D"
            )
        ) return 3;


        const number =
            Number(value);


        if (
            Number.isNaN(
                number
            )
        ) {

            return -1;

        }


        if (
            number >= 1 &&
            number <= 4
        ) {

            return number - 1;

        }


        if (
            number >= 0 &&
            number <= 3
        ) {

            return number;

        }

    }


    return -1;

}


// ==========================================================
// NORMALIZE STUDENT ANSWER
// ==========================================================

function normalizeStudentAnswer(answer) {

    if (
        answer === null ||
        answer === undefined ||
        answer === ""
    ) {

        return null;

    }


    if (
        typeof answer === "object"
    ) {

        answer =
            extractAnswerValue(
                answer
            );

    }


    if (
        answer === null ||
        answer === undefined ||
        answer === ""
    ) {

        return null;

    }


    if (
        typeof answer === "string"
    ) {

        const value =
            answer
                .trim()
                .toUpperCase();


        if (
            value === "A" ||
            value.startsWith("A.") ||
            value.startsWith("A)")
        ) return 0;


        if (
            value === "B" ||
            value.startsWith("B.") ||
            value.startsWith("B)")
        ) return 1;


        if (
            value === "C" ||
            value.startsWith("C.") ||
            value.startsWith("C)")
        ) return 2;


        if (
            value === "D" ||
            value.startsWith("D.") ||
            value.startsWith("D)")
        ) return 3;


        if (
            value.includes(
                "OPTION A"
            )
        ) return 0;


        if (
            value.includes(
                "OPTION B"
            )
        ) return 1;


        if (
            value.includes(
                "OPTION C"
            )
        ) return 2;


        if (
            value.includes(
                "OPTION D"
            )
        ) return 3;


        const number =
            Number(value);


        if (
            Number.isNaN(
                number
            )
        ) {

            return null;

        }


        if (
            number >= 1 &&
            number <= 4
        ) {

            return number - 1;

        }


        if (
            number >= 0 &&
            number <= 3
        ) {

            return number;

        }


        return null;

    }


    if (
        typeof answer === "number"
    ) {

        if (
            answer >= 0 &&
            answer <= 3
        ) {

            return answer;

        }


        if (
            answer >= 1 &&
            answer <= 4
        ) {

            return answer - 1;

        }

    }


    return null;

}


// ==========================================================
// LETTER → INDEX
// ==========================================================

function letterToIndex(letter) {

    const value =
        String(
            letter
        ).toUpperCase();


    if (value === "A") return 0;
    if (value === "B") return 1;
    if (value === "C") return 2;
    if (value === "D") return 3;


    return -1;

}


// ==========================================================
// SEARCH
// ==========================================================

if (searchResults) {

    searchResults.addEventListener(
        "input",
        function () {

            const value =
                this.value
                    .toLowerCase()
                    .trim();


            const filtered =
                allResults.filter(
                    result => {

                        const text =
                            `${result.testName} ` +
                            `${result.categoryName} ` +
                            `${result.percentage}`;


                        return text
                            .toLowerCase()
                            .includes(
                                value
                            );

                    }
                );


            renderResults(
                filtered
            );

        }
    );

}


// ==========================================================
// CLOSE MODAL
// ==========================================================

if (closeModalBtn) {

    closeModalBtn.onclick =
        function () {

            if (answerModal) {

                answerModal.classList.remove(
                    "show"
                );

            }

        };

}


// ==========================================================
// CLICK OUTSIDE
// ==========================================================

if (answerModal) {

    answerModal.addEventListener(
        "click",
        function (event) {

            if (
                event.target ===
                answerModal
            ) {

                answerModal.classList.remove(
                    "show"
                );

            }

        }
    );

}


// ==========================================================
// ESC KEY
// ==========================================================

document.addEventListener(
    "keydown",
    function (event) {

        if (
            event.key === "Escape" &&
            answerModal
        ) {

            answerModal.classList.remove(
                "show"
            );

        }

    }
);


// ==========================================================
// BACK BUTTON
// ==========================================================

if (backBtn) {

    backBtn.onclick =
        function () {

            window.location.href =
                "student-dashboard-v2.html";

        };

}


// ==========================================================
// DATE
// ==========================================================

function formatDate(value) {

    if (!value) {

        return "-";

    }


    let date;


    if (
        value &&
        typeof value.toDate === "function"
    ) {

        date =
            value.toDate();

    }
    else {

        date =
            new Date(value);

    }


    if (
        Number.isNaN(
            date.getTime()
        )
    ) {

        return "-";

    }


    return date.toLocaleString(
        "en-IN",
        {
            day: "2-digit",
            month: "short",
            year: "numeric"
        }
    );

}


// ==========================================================
// TIME
// ==========================================================

function formatTime(seconds) {

    seconds =
        Number(
            seconds || 0
        );


    const minutes =
        Math.floor(
            seconds / 60
        );


    const remaining =
        seconds % 60;


    return (
        String(minutes)
            .padStart(2, "0")
        +
        ":"
        +
        String(remaining)
            .padStart(2, "0")
    );

}


// ==========================================================
// ESCAPE HTML
// ==========================================================

function escapeHTML(value) {

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
// START
// ==========================================================

console.log(
    "🚀 My Results V2 - DUPLICATE SAFE VERSION STARTED"
);


loadStudent();

loadResults();