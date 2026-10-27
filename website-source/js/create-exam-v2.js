// ==========================================================
// RAJ MOCK TEST V2.0
// CREATE EXAM + CATEGORY
// FIRESTORE
// ==========================================================

import { db } from "./firebase.js";

import {
    collection,
    getDocs,
    addDoc,
    serverTimestamp
} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";


// ==========================================================
// ELEMENTS
// ==========================================================

const examSelect =
    document.getElementById("examSelect");

const categoryExamSelect =
    document.getElementById("categoryExamSelect");

const examName =
    document.getElementById("examName");

const examIcon =
    document.getElementById("examIcon");

const examOrder =
    document.getElementById("examOrder");

const examDescription =
    document.getElementById("examDescription");

const createExamBtn =
    document.getElementById("createExamBtn");

const categoryName =
    document.getElementById("categoryName");

const categoryIcon =
    document.getElementById("categoryIcon");

const categoryOrder =
    document.getElementById("categoryOrder");

const categoryDescription =
    document.getElementById("categoryDescription");

const createCategoryBtn =
    document.getElementById("createCategoryBtn");

const examMessage =
    document.getElementById("examMessage");

const categoryMessage =
    document.getElementById("categoryMessage");

const examList =
    document.getElementById("examList");

const backBtn =
    document.getElementById("backBtn");


// ==========================================================
// STATE
// ==========================================================

let exams = [];


// ==========================================================
// LOAD EXAMS
// ==========================================================

async function loadExams() {

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


        categoryExamSelect.innerHTML = `
            <option value="">
                Select Exam
            </option>
        `;


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


            if (
                status === "inactive"
            ) {

                return;

            }


            const exam = {

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

            };


            exams.push(exam);


            // ------------------------------------------
            // EXAM DROPDOWN
            // ------------------------------------------

            const option1 =
                document.createElement(
                    "option"
                );

            option1.value =
                exam.id;

            option1.textContent =
                exam.name;

            examSelect.appendChild(
                option1
            );


            // ------------------------------------------
            // CATEGORY DROPDOWN
            // ------------------------------------------

            const option2 =
                document.createElement(
                    "option"
                );

            option2.value =
                exam.id;

            option2.textContent =
                exam.name;

            categoryExamSelect.appendChild(
                option2
            );

        });


        exams.sort(
            (a, b) =>
                a.order - b.order
        );


        renderExamList();


        console.log(
            "✅ EXAMS LOADED:",
            exams
        );

    }
    catch (error) {

        console.error(
            "❌ LOAD EXAMS ERROR:",
            error
        );

        showMessage(
            examMessage,
            "Unable to load exams.",
            "error"
        );

    }

}


// ==========================================================
// CREATE EXAM
// ==========================================================

if (createExamBtn) {

    createExamBtn.addEventListener(
        "click",
        createExam
    );

}


async function createExam() {

    const name =
        examName.value.trim();

    const icon =
        examIcon.value.trim() ||
        "📚";

    const description =
        examDescription.value.trim() ||
        "Practice Tests";

    const order =
        Number(
            examOrder.value
        ) || 999;


    if (!name) {

        showMessage(
            examMessage,
            "Please enter exam name.",
            "error"
        );

        examName.focus();

        return;

    }


    // Prevent duplicate exam names

    const duplicate =
        exams.some(
            exam =>
                exam.name
                    .toLowerCase() ===
                name.toLowerCase()
        );


    if (duplicate) {

        showMessage(
            examMessage,
            "This exam already exists.",
            "error"
        );

        return;

    }


    createExamBtn.disabled =
        true;

    createExamBtn.textContent =
        "⏳ Creating Exam...";


    try {

        const examRef =
            await addDoc(
                collection(
                    db,
                    "exams"
                ),
                {

                    name:
                        name,

                    title:
                        name,

                    icon:
                        icon,

                    description:
                        description,

                    order:
                        order,

                    status:
                        "Publish",

                    createdAt:
                        serverTimestamp()

                }
            );


        console.log(
            "✅ EXAM CREATED:",
            examRef.id
        );


        showMessage(
            examMessage,
            "✅ Exam created successfully!",
            "success"
        );


        // Clear form

        examName.value = "";

        examDescription.value = "";

        examIcon.value = "📚";

        examOrder.value = "1";


        // Reload dropdowns

        await loadExams();


        // Automatically select new exam

        examSelect.value =
            examRef.id;

        categoryExamSelect.value =
            examRef.id;


    }
    catch (error) {

        console.error(
            "❌ CREATE EXAM ERROR:",
            error
        );


        showMessage(
            examMessage,
            "❌ Unable to create exam: " +
            error.message,
            "error"
        );

    }
    finally {

        createExamBtn.disabled =
            false;

        createExamBtn.textContent =
            "➕ Create Exam";

    }

}


// ==========================================================
// CREATE CATEGORY
// ==========================================================

if (createCategoryBtn) {

    createCategoryBtn.addEventListener(
        "click",
        createCategory
    );

}


async function createCategory() {

    const selectedExamId =
        categoryExamSelect.value;

    const name =
        categoryName.value.trim();

    const icon =
        categoryIcon.value.trim() ||
        "📂";

    const description =
        categoryDescription.value.trim() ||
        "Practice Tests";

    const order =
        Number(
            categoryOrder.value
        ) || 999;


    if (!selectedExamId) {

        showMessage(
            categoryMessage,
            "Please choose an exam.",
            "error"
        );

        categoryExamSelect.focus();

        return;

    }


    if (!name) {

        showMessage(
            categoryMessage,
            "Please enter category name.",
            "error"
        );

        categoryName.focus();

        return;

    }


    const selectedExam =
        exams.find(
            exam =>
                exam.id ===
                selectedExamId
        );


    createCategoryBtn.disabled =
        true;

    createCategoryBtn.textContent =
        "⏳ Creating Category...";


    try {

        const categoryRef =
            await addDoc(
                collection(
                    db,
                    "categories"
                ),
                {

                    name:
                        name,

                    title:
                        name,

                    icon:
                        icon,

                    description:
                        description,

                    order:
                        order,

                    status:
                        "Publish",

                    examId:
                        selectedExamId,

                    examName:
                        selectedExam?.name ||
                        "",

                    createdAt:
                        serverTimestamp()

                }
            );


        console.log(
            "✅ CATEGORY CREATED:",
            categoryRef.id
        );


        showMessage(
            categoryMessage,
            "✅ Category created successfully!",
            "success"
        );


        // Clear category form

        categoryName.value = "";

        categoryDescription.value = "";

        categoryIcon.value = "📂";

        categoryOrder.value = "1";


    }
    catch (error) {

        console.error(
            "❌ CREATE CATEGORY ERROR:",
            error
        );


        showMessage(
            categoryMessage,
            "❌ Unable to create category: " +
            error.message,
            "error"
        );

    }
    finally {

        createCategoryBtn.disabled =
            false;

        createCategoryBtn.textContent =
            "➕ Create Category";

    }

}


// ==========================================================
// RENDER EXAM LIST
// ==========================================================

function renderExamList() {

    if (!examList) {
        return;
    }


    examList.innerHTML = "";


    if (exams.length === 0) {

        examList.innerHTML = `

            <div class="empty-box">

                <div>
                    📚
                </div>

                <h3>
                    No Exams Available
                </h3>

                <p>
                    Create your first exam above.
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

            <div class="exam-item-icon">

                ${escapeHTML(
                    exam.icon
                )}

            </div>


            <div class="exam-item-content">

                <h3>

                    ${escapeHTML(
                        exam.name
                    )}

                </h3>

                <p>

                    ${escapeHTML(
                        exam.description
                    )}

                </p>

            </div>


            <div class="exam-status">

                Active

            </div>

        `;


        examList.appendChild(
            item
        );

    });

}


// ==========================================================
// MESSAGE
// ==========================================================

function showMessage(
    element,
    message,
    type
) {

    if (!element) {
        return;
    }


    element.textContent =
        message;


    element.className =
        "message " + type;


    setTimeout(
        () => {

            element.className =
                "message";

        },
        5000
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
// START
// ==========================================================

console.log(
    "🚀 CREATE EXAM V2 STARTED"
);


loadExams();