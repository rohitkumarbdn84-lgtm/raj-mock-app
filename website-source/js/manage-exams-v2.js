// ==========================================================
// RAJ MOCK TEST V2.0
// MANAGE EXAMS
// DELETE EXAM + CATEGORIES + TESTS + QUESTIONS
// FIRESTORE
// ==========================================================

import { db } from "./firebase.js";

import {
    collection,
    getDocs,
    deleteDoc,
    doc,
    query,
    where
} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";


// ==========================================================
// ELEMENTS
// ==========================================================

const examList =
    document.getElementById("examList");

const backBtn =
    document.getElementById("backBtn");

const deleteModal =
    document.getElementById("deleteModal");

const deleteExamName =
    document.getElementById("deleteExamName");

const cancelDeleteBtn =
    document.getElementById("cancelDeleteBtn");

const confirmDeleteBtn =
    document.getElementById("confirmDeleteBtn");


// ==========================================================
// STATE
// ==========================================================

let exams = [];

let selectedExam = null;


// ==========================================================
// LOAD EXAMS
// ==========================================================

async function loadExams() {

    if (!examList) {
        return;
    }

    showLoading();


    try {

        const snapshot =
            await getDocs(
                collection(
                    db,
                    "exams"
                )
            );


        exams = [];


        snapshot.forEach(docSnap => {

            const data =
                docSnap.data();


            const status =
                String(
                    data.status ||
                    "Publish"
                )
                .trim()
                .toLowerCase();


            // Hide inactive exams

            if (
                status === "inactive"
            ) {
                return;
            }


            exams.push({

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
                    "Exam"

            });

        });


        console.log(
            "✅ EXAMS:",
            exams
        );


        renderExams();


    }
    catch (error) {

        console.error(
            "❌ LOAD EXAMS ERROR:",
            error
        );


        showError(
            error.message
        );

    }

}


// ==========================================================
// RENDER EXAMS
// ==========================================================

function renderExams() {

    examList.innerHTML = "";


    if (
        exams.length === 0
    ) {

        examList.innerHTML = `

            <div class="empty-box">

                <div class="empty-icon">
                    🎯
                </div>

                <h3>
                    No Exams Found
                </h3>

                <p>
                    Create an exam first.
                </p>

            </div>

        `;

        return;

    }


    exams.forEach(exam => {

        const item =
            document.createElement(
                "div"
            );


        item.className =
            "exam-item";


        item.innerHTML = `

            <div class="exam-left">

                <div class="exam-icon">
                    ${escapeHTML(exam.icon)}
                </div>


                <div class="exam-info">

                    <h3>
                        ${escapeHTML(exam.name)}
                    </h3>

                    <p>
                        ${escapeHTML(exam.description)}
                    </p>

                    <div class="exam-id">
                        ID: ${escapeHTML(exam.id)}
                    </div>

                </div>

            </div>


            <button
                type="button"
                class="delete-btn-small"
            >
                🗑 Delete
            </button>

        `;


        const deleteBtn =
            item.querySelector(
                ".delete-btn-small"
            );


        deleteBtn.addEventListener(
            "click",
            function () {

                openDeleteModal(
                    exam
                );

            }
        );


        examList.appendChild(item);

    });

}


// ==========================================================
// OPEN DELETE MODAL
// ==========================================================

function openDeleteModal(exam) {

    selectedExam =
        exam;


    if (deleteExamName) {

        deleteExamName.textContent =
            exam.name;

    }


    if (deleteModal) {

        deleteModal.classList.remove(
            "hidden"
        );

    }

}


// ==========================================================
// CLOSE DELETE MODAL
// ==========================================================

function closeDeleteModal() {

    selectedExam =
        null;


    if (deleteModal) {

        deleteModal.classList.add(
            "hidden"
        );

    }

}


if (cancelDeleteBtn) {

    cancelDeleteBtn.addEventListener(
        "click",
        closeDeleteModal
    );

}


// ==========================================================
// CLICK OUTSIDE MODAL
// ==========================================================

if (deleteModal) {

    deleteModal.addEventListener(
        "click",
        function (event) {

            if (
                event.target ===
                deleteModal
            ) {

                closeDeleteModal();

            }

        }
    );

}


// ==========================================================
// CONFIRM DELETE
// ==========================================================

if (confirmDeleteBtn) {

    confirmDeleteBtn.addEventListener(
        "click",
        deleteSelectedExam
    );

}


// ==========================================================
// DELETE COMPLETE EXAM TREE
// ==========================================================

async function deleteSelectedExam() {

    if (!selectedExam) {

        return;

    }


    const exam =
        selectedExam;


    confirmDeleteBtn.disabled =
        true;


    confirmDeleteBtn.textContent =
        "⏳ Deleting...";


    try {

        console.log(
            "===================================="
        );

        console.log(
            "🗑 DELETE EXAM STARTED"
        );

        console.log(
            "EXAM ID:",
            exam.id
        );

        console.log(
            "EXAM NAME:",
            exam.name
        );

        console.log(
            "===================================="
        );


        // ==================================================
        // 1. GET CATEGORIES
        // ==================================================

        const categoriesSnapshot =
            await getDocs(
                query(
                    collection(
                        db,
                        "categories"
                    ),
                    where(
                        "examId",
                        "==",
                        exam.id
                    )
                )
            );


        console.log(
            "📂 CATEGORIES FOUND:",
            categoriesSnapshot.size
        );


        const categoryIds = [];


        categoriesSnapshot.forEach(
            categoryDoc => {

                categoryIds.push(
                    categoryDoc.id
                );

            }
        );


        // ==================================================
        // 2. GET TESTS
        // ==================================================

        const testsSnapshot =
            await getDocs(
                query(
                    collection(
                        db,
                        "tests"
                    ),
                    where(
                        "examId",
                        "==",
                        exam.id
                    )
                )
            );


        console.log(
            "📝 TESTS FOUND:",
            testsSnapshot.size
        );


        const testIds = [];


        testsSnapshot.forEach(
            testDoc => {

                testIds.push(
                    testDoc.id
                );

            }
        );


        // ==================================================
        // 3. DELETE QUESTIONS
        // ==================================================

        let deletedQuestions = 0;


        for (
            const testId of testIds
        ) {

            const questionsSnapshot =
                await getDocs(
                    query(
                        collection(
                            db,
                            "questions"
                        ),
                        where(
                            "testId",
                            "==",
                            testId
                        )
                    )
                );


            for (
                const questionDoc
                of questionsSnapshot.docs
            ) {

                await deleteDoc(
                    doc(
                        db,
                        "questions",
                        questionDoc.id
                    )
                );


                deletedQuestions++;

            }

        }


        // ==================================================
        // 4. EXTRA SAFETY
        // ==================================================
        // Delete any question having examId directly.

        const examQuestionsSnapshot =
            await getDocs(
                query(
                    collection(
                        db,
                        "questions"
                    ),
                    where(
                        "examId",
                        "==",
                        exam.id
                    )
                )
            );


        for (
            const questionDoc
            of examQuestionsSnapshot.docs
        ) {

            await deleteDoc(
                doc(
                    db,
                    "questions",
                    questionDoc.id
                )
            );


            deletedQuestions++;

        }


        console.log(
            "❌ QUESTIONS DELETED:",
            deletedQuestions
        );


        // ==================================================
        // 5. DELETE TESTS
        // ==================================================

        for (
            const testId of testIds
        ) {

            await deleteDoc(
                doc(
                    db,
                    "tests",
                    testId
                )
            );

        }


        console.log(
            "❌ TESTS DELETED:",
            testIds.length
        );


        // ==================================================
        // 6. DELETE CATEGORIES
        // ==================================================

        for (
            const categoryId
            of categoryIds
        ) {

            await deleteDoc(
                doc(
                    db,
                    "categories",
                    categoryId
                )
            );

        }


        console.log(
            "❌ CATEGORIES DELETED:",
            categoryIds.length
        );


        // ==================================================
        // 7. DELETE EXAM
        // ==================================================

        await deleteDoc(
            doc(
                db,
                "exams",
                exam.id
            )
        );


        console.log(
            "❌ EXAM DELETED:",
            exam.id
        );


        // ==================================================
        // SUCCESS
        // ==================================================

        alert(
            "✅ Exam deleted successfully!\n\n" +

            "Exam: " +
            exam.name +

            "\n\nCategories deleted: " +
            categoryIds.length +

            "\nTests deleted: " +
            testIds.length +

            "\nQuestions deleted: " +
            deletedQuestions
        );


        closeDeleteModal();


        // Reload

        await loadExams();

    }
    catch (error) {

        console.error(
            "❌ DELETE EXAM ERROR:",
            error
        );


        alert(
            "❌ Unable to delete exam.\n\n" +
            error.message
        );

    }
    finally {

        confirmDeleteBtn.disabled =
            false;

        confirmDeleteBtn.textContent =
            "🗑 Delete Everything";

    }

}


// ==========================================================
// LOADING
// ==========================================================

function showLoading() {

    examList.innerHTML = `

        <div class="loading-box">

            <div class="loader"></div>

            <p>
                Loading exams...
            </p>

        </div>

    `;

}


// ==========================================================
// ERROR
// ==========================================================

function showError(message) {

    examList.innerHTML = `

        <div class="empty-box">

            <div class="empty-icon">
                ⚠️
            </div>

            <h3>
                Unable to Load Exams
            </h3>

            <p>
                ${escapeHTML(
                    message ||
                    "Something went wrong."
                )}
            </p>

        </div>

    `;

}


// ==========================================================
// BACK BUTTON
// ==========================================================

if (backBtn) {

    backBtn.addEventListener(
        "click",
        function () {

            window.location.href =
                "admin-dashboard-v2.html";

        }
    );

}


// ==========================================================
// HTML SAFETY
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
    "🚀 MANAGE EXAMS V2 STARTED"
);

loadExams();