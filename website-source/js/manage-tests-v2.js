// ==========================================================
// RAJ MOCK TEST V2.0
// MANAGE TESTS
// DELETE TEST + ALL ITS QUESTIONS
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

const examSelect =
    document.getElementById("examSelect");

const categorySelect =
    document.getElementById("categorySelect");

const testList =
    document.getElementById("testList");

const backBtn =
    document.getElementById("backBtn");


// ==========================================================
// STATE
// ==========================================================

let exams = [];

let categories = [];

let currentTests = [];


// ==========================================================
// LOAD EXAMS
// ==========================================================

async function loadExams() {

    if (!examSelect) return;

    examSelect.innerHTML = `
        <option value="">
            Loading Exams...
        </option>
    `;

    try {

        const snapshot =
            await getDocs(
                collection(
                    db,
                    "exams"
                )
            );


        exams = [];


        examSelect.innerHTML = `
            <option value="">
                Select Exam
            </option>
        `;


        snapshot.forEach(docSnap => {

            const data =
                docSnap.data();


            const status =
                String(
                    data.status || "Publish"
                )
                .trim()
                .toLowerCase();


            if (status === "inactive") {
                return;
            }


            const exam = {

                id:
                    docSnap.id,

                name:
                    data.name ||
                    data.title ||
                    "Unnamed Exam"

            };


            exams.push(exam);


            const option =
                document.createElement(
                    "option"
                );


            option.value =
                exam.id;


            option.textContent =
                exam.name;


            examSelect.appendChild(
                option
            );

        });


        console.log(
            "✅ Exams loaded:",
            exams.length
        );

    }
    catch (error) {

        console.error(
            "❌ EXAM LOAD ERROR:",
            error
        );


        examSelect.innerHTML = `
            <option value="">
                Unable to load exams
            </option>
        `;


        alert(
            "Unable to load exams.\n\n" +
            error.message
        );

    }

}


// ==========================================================
// LOAD CATEGORIES
// ==========================================================

async function loadCategories(
    examId
) {

    categorySelect.disabled =
        true;


    categorySelect.innerHTML = `
        <option value="">
            Loading Categories...
        </option>
    `;


    testList.innerHTML = `
        <div class="empty-box">

            <div class="empty-icon">
                📂
            </div>

            <h3>
                Select Category
            </h3>

            <p>
                Choose a category to view tests.
            </p>

        </div>
    `;


    if (!examId) {

        categorySelect.innerHTML = `
            <option value="">
                Select Category
            </option>
        `;

        return;
    }


    try {

        const categoriesRef =
            collection(
                db,
                "categories"
            );


        const q =
            query(
                categoriesRef,
                where(
                    "examId",
                    "==",
                    examId
                )
            );


        const snapshot =
            await getDocs(q);


        categories = [];


        categorySelect.innerHTML = `
            <option value="">
                Select Category
            </option>
        `;


        snapshot.forEach(docSnap => {

            const data =
                docSnap.data();


            const status =
                String(
                    data.status || "Publish"
                )
                .trim()
                .toLowerCase();


            if (status === "inactive") {
                return;
            }


            const category = {

                id:
                    docSnap.id,

                name:
                    data.name ||
                    data.title ||
                    "Unnamed Category"

            };


            categories.push(
                category
            );


            const option =
                document.createElement(
                    "option"
                );


            option.value =
                category.id;


            option.textContent =
                category.name;


            categorySelect.appendChild(
                option
            );

        });


        categorySelect.disabled =
            false;


        if (categories.length === 0) {

            testList.innerHTML = `
                <div class="empty-box">

                    <div class="empty-icon">
                        📂
                    </div>

                    <h3>
                        No Categories
                    </h3>

                    <p>
                        No category found for this exam.
                    </p>

                </div>
            `;

        }


        console.log(
            "✅ Categories loaded:",
            categories.length
        );

    }
    catch (error) {

        console.error(
            "❌ CATEGORY LOAD ERROR:",
            error
        );


        categorySelect.innerHTML = `
            <option value="">
                Unable to load categories
            </option>
        `;


        testList.innerHTML = `
            <div class="empty-box">

                <div class="empty-icon">
                    ⚠️
                </div>

                <h3>
                    Category Loading Error
                </h3>

                <p>
                    ${escapeHTML(error.message)}
                </p>

            </div>
        `;

    }

}


// ==========================================================
// EXAM CHANGE
// ==========================================================

if (examSelect) {

    examSelect.addEventListener(
        "change",
        function () {

            loadCategories(
                this.value
            );

        }
    );

}


// ==========================================================
// CATEGORY CHANGE
// ==========================================================

if (categorySelect) {

    categorySelect.addEventListener(
        "change",
        function () {

            if (!this.value) {

                testList.innerHTML = `
                    <div class="empty-box">

                        <div class="empty-icon">
                            📝
                        </div>

                        <h3>
                            Select Category
                        </h3>

                        <p>
                            Choose a category to view tests.
                        </p>

                    </div>
                `;

                return;
            }


            loadTests(
                this.value
            );

        }
    );

}


// ==========================================================
// LOAD TESTS
// ==========================================================

async function loadTests(
    categoryId
) {

    showLoading();


    try {

        const testsRef =
            collection(
                db,
                "tests"
            );


        const q =
            query(
                testsRef,
                where(
                    "categoryId",
                    "==",
                    categoryId
                )
            );


        const snapshot =
            await getDocs(q);


        currentTests = [];


        snapshot.forEach(docSnap => {

            const data =
                docSnap.data();


            const status =
                String(
                    data.status || "Publish"
                )
                .trim()
                .toLowerCase();


            if (status === "inactive") {
                return;
            }


            currentTests.push({

                id:
                    docSnap.id,

                name:
                    data.name ||
                    data.title ||
                    "Unnamed Test",

                description:
                    data.description ||
                    data.subject ||
                    "Practice Test",

                duration:
                    Number(
                        data.duration ||
                        data.time ||
                        60
                    ),

                questionCount:
                    Number(
                        data.questionCount ||
                        data.totalQuestions ||
                        data.total ||
                        0
                    ),

                plan:
                    String(
                        data.plan ||
                        "free"
                    )
                    .trim()
                    .toLowerCase(),

                order:
                    Number(
                        data.order ||
                        999
                    )

            });

        });


        currentTests.sort(
            (a, b) =>
                a.order - b.order
        );


        console.log(
            "✅ TESTS:",
            currentTests
        );


        renderTests(
            currentTests
        );

    }
    catch (error) {

        console.error(
            "❌ TEST LOAD ERROR:",
            error
        );


        showError(
            error.message
        );

    }

}


// ==========================================================
// RENDER TESTS
// ==========================================================

function renderTests(
    tests
) {

    testList.innerHTML = "";


    if (tests.length === 0) {

        testList.innerHTML = `
            <div class="empty-box">

                <div class="empty-icon">
                    📝
                </div>

                <h3>
                    No Tests Available
                </h3>

                <p>
                    No test found in this category.
                </p>

            </div>
        `;

        return;
    }


    tests.forEach(
        test => {

            const item =
                document.createElement(
                    "div"
                );


            item.className =
                "test-item";


            const planClass =
                test.plan === "premium"
                    ? "premium"
                    : "free";


            const planText =
                test.plan === "premium"
                    ? "💎 Premium"
                    : "🆓 Free";


            item.innerHTML = `

                <div class="test-info">

                    <div class="test-title">

                        ${escapeHTML(
                            test.name
                        )}

                    </div>


                    <div class="test-description">

                        ${escapeHTML(
                            test.description
                        )}

                    </div>


                    <div class="test-meta">

                        <span class="meta">
                            ⏱ ${test.duration} Min
                        </span>

                        <span class="meta">
                            📝 ${test.questionCount} Questions
                        </span>

                        <span class="meta ${planClass}">
                            ${planText}
                        </span>

                    </div>

                </div>


                <button
                    type="button"
                    class="delete-test-btn"
                    data-id="${escapeHTML(test.id)}"
                    data-name="${escapeHTML(test.name)}"
                >
                    🗑 Delete Test
                </button>

            `;


            const deleteBtn =
                item.querySelector(
                    ".delete-test-btn"
                );


            deleteBtn.addEventListener(
                "click",
                function () {

                    deleteTest(
                        test.id,
                        test.name,
                        this
                    );

                }
            );


            testList.appendChild(
                item
            );

        }
    );

}


// ==========================================================
// DELETE TEST
// ==========================================================

async function deleteTest(
    testId,
    testName,
    button
) {

    if (!testId) {

        alert(
            "❌ Test ID missing."
        );

        return;
    }


    const confirmDelete =
        confirm(
            `⚠️ Delete Test?\n\n` +
            `${testName}\n\n` +
            `This will permanently delete:\n` +
            `• The test\n` +
            `• All questions of this test\n\n` +
            `This action cannot be undone.`
        );


    if (!confirmDelete) {
        return;
    }


    button.disabled =
        true;

    button.textContent =
        "⏳ Deleting...";


    try {

        // ==================================================
        // STEP 1
        // FIND QUESTIONS
        // ==================================================

        console.log(
            "🔎 Finding questions for:",
            testId
        );


        const questionsRef =
            collection(
                db,
                "questions"
            );


        const q =
            query(
                questionsRef,
                where(
                    "testId",
                    "==",
                    testId
                )
            );


        const questionSnapshot =
            await getDocs(q);


        console.log(
            "📝 Questions found:",
            questionSnapshot.size
        );


        // ==================================================
        // STEP 2
        // DELETE QUESTIONS
        // ==================================================

        for (
            const questionDoc
            of questionSnapshot.docs
        ) {

            await deleteDoc(
                doc(
                    db,
                    "questions",
                    questionDoc.id
                )
            );

        }


        console.log(
            "✅ All questions deleted"
        );


        // ==================================================
        // STEP 3
        // DELETE TEST
        // ==================================================

        await deleteDoc(
            doc(
                db,
                "tests",
                testId
            )
        );


        console.log(
            "✅ Test deleted:",
            testId
        );


        // ==================================================
        // STEP 4
        // REMOVE FROM LOCAL ARRAY
        // ==================================================

        currentTests =
            currentTests.filter(
                test =>
                    test.id !== testId
            );


        // ==================================================
        // STEP 5
        // RENDER AGAIN
        // ==================================================

        renderTests(
            currentTests
        );


        alert(
            `✅ Test deleted successfully!\n\n` +
            `Test: ${testName}\n` +
            `Questions deleted: ${questionSnapshot.size}`
        );

    }
    catch (error) {

        console.error(
            "❌ DELETE TEST ERROR:",
            error
        );


        alert(
            "❌ Unable to delete test.\n\n" +
            error.message
        );


        button.disabled =
            false;

        button.textContent =
            "🗑 Delete Test";

    }

}


// ==========================================================
// LOADING
// ==========================================================

function showLoading() {

    testList.innerHTML = `

        <div class="loading-box">

            <div class="loader"></div>

            <p>
                Loading tests...
            </p>

        </div>

    `;

}


// ==========================================================
// ERROR
// ==========================================================

function showError(
    message
) {

    testList.innerHTML = `

        <div class="empty-box">

            <div class="empty-icon">
                ⚠️
            </div>

            <h3>
                Unable to Load Tests
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
// START
// ==========================================================

console.log(
    "🚀 MANAGE TESTS V2 STARTED"
);

loadExams();