// ==========================================================
// RAJ MOCK TEST V2.0
// CREATE CATEGORY
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

const categoryName =
    document.getElementById("categoryName");

const categoryDescription =
    document.getElementById("categoryDescription");

const categoryIcon =
    document.getElementById("categoryIcon");

const categoryOrder =
    document.getElementById("categoryOrder");

const categoryStatus =
    document.getElementById("categoryStatus");

const createCategoryBtn =
    document.getElementById("createCategoryBtn");

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

    if (!examSelect) {
        return;
    }

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


            // ==================================================
            // STATUS
            // ==================================================

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
            "✅ EXAMS LOADED:",
            exams.length
        );


        if (exams.length === 0) {

            examSelect.innerHTML = `
                <option value="">
                    No Exams Available
                </option>
            `;

        }

    }
    catch (error) {

        console.error(
            "❌ EXAM LOAD ERROR:",
            error
        );


        examSelect.innerHTML = `
            <option value="">
                Unable to Load Exams
            </option>
        `;


        alert(
            "Unable to load exams.\n\n" +
            error.message
        );

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

    // ======================================================
    // GET VALUES
    // ======================================================

    const examId =
        examSelect.value;

    const name =
        categoryName.value.trim();

    const description =
        categoryDescription.value.trim();

    const icon =
        categoryIcon.value.trim() ||
        "📂";

    const orderValue =
        Number(
            categoryOrder.value
        );

    const status =
        categoryStatus.value;


    // ======================================================
    // VALIDATION
    // ======================================================

    if (!examId) {

        alert(
            "Please choose an exam."
        );

        examSelect.focus();

        return;

    }


    if (!name) {

        alert(
            "Please enter category name."
        );

        categoryName.focus();

        return;

    }


    if (!description) {

        alert(
            "Please enter category description."
        );

        categoryDescription.focus();

        return;

    }


    // ======================================================
    // GET EXAM NAME
    // ======================================================

    const selectedExam =
        exams.find(
            exam =>
                exam.id === examId
        );


    // ======================================================
    // DISABLE BUTTON
    // ======================================================

    createCategoryBtn.disabled =
        true;

    createCategoryBtn.textContent =
        "⏳ Creating Category...";


    try {

        // ==================================================
        // FIRESTORE
        // ==================================================

        const categoryRef =
            await addDoc(
                collection(
                    db,
                    "categories"
                ),
                {

                    // ------------------------------
                    // EXAM
                    // ------------------------------

                    examId:
                        examId,

                    examName:
                        selectedExam?.name ||
                        "",


                    // ------------------------------
                    // CATEGORY
                    // ------------------------------

                    name:
                        name,

                    description:
                        description,

                    icon:
                        icon,


                    // ------------------------------
                    // ORDER
                    // ------------------------------

                    order:
                        orderValue > 0
                        ? orderValue
                        : 999,


                    // ------------------------------
                    // STATUS
                    // ------------------------------

                    status:
                        status,


                    // ------------------------------
                    // TIMESTAMP
                    // ------------------------------

                    createdAt:
                        serverTimestamp()

                }
            );


        console.log(
            "✅ CATEGORY CREATED:",
            categoryRef.id
        );


        // ==================================================
        // SUCCESS
        // ==================================================

        alert(
            "✅ Category created successfully!"
        );


        // ==================================================
        // RESET FORM
        // ==================================================

        examSelect.value =
            examId;

        categoryName.value =
            "";

        categoryDescription.value =
            "";

        categoryIcon.value =
            "📂";

        categoryOrder.value =
            "";

        categoryStatus.value =
            "Publish";


        categoryName.focus();

    }
    catch (error) {

        console.error(
            "❌ CATEGORY CREATE ERROR:",
            error
        );


        alert(
            "❌ Unable to create category.\n\n" +
            error.message
        );

    }
    finally {

        createCategoryBtn.disabled =
            false;

        createCategoryBtn.textContent =
            "📂 Create Category";

    }

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
    "🚀 CREATE CATEGORY V2 STARTED"
);


loadExams();