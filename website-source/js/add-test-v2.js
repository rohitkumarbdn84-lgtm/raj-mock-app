// ==========================================================
// RAJ MOCK TEST V2.0
// ADD TEST
// SINGLE + BULK QUESTIONS
// FIRESTORE
// ==========================================================

import { db, storage } from "./firebase.js";
import { ref as storageRef, uploadBytes, getDownloadURL } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-storage.js";

import {
    collection,
    getDocs,
    addDoc,
    query,
    where,
    serverTimestamp
} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";


// ==========================================================
// ELEMENTS
// ==========================================================

const examSelect = document.getElementById("examSelect");
const categorySelect = document.getElementById("categorySelect");

const testName = document.getElementById("testName");
const duration = document.getElementById("duration");
const plan = document.getElementById("plan");

const questionText = document.getElementById("questionText");
const singleImageFile = document.getElementById("singleImageFile");
const bulkImageFiles = document.getElementById("bulkImageFiles");
const optionA = document.getElementById("optionA");
const optionB = document.getElementById("optionB");
const optionC = document.getElementById("optionC");
const optionD = document.getElementById("optionD");

const correctAnswer = document.getElementById("correctAnswer");

const addQuestionBtn = document.getElementById("addQuestionBtn");

const bulkQuestions = document.getElementById("bulkQuestions");
const parseBulkBtn = document.getElementById("parseBulkBtn");

const questionList = document.getElementById("questionList");
const questionCount = document.getElementById("questionCount");

const saveTestBtn = document.getElementById("saveTestBtn");
const backBtn = document.getElementById("backBtn");

const singleModeBtn = document.getElementById("singleModeBtn");
const bulkModeBtn = document.getElementById("bulkModeBtn");

const singleQuestionArea =
    document.getElementById("singleQuestionArea");

const bulkQuestionArea =
    document.getElementById("bulkQuestionArea");


// ==========================================================
// STATE
// ==========================================================

let questions = [];
let exams = [];
let categories = [];


// ==========================================================
// LOAD EXAMS
// ==========================================================

async function loadExams() {

    console.log("🔄 Loading exams...");

    try {

        const snapshot = await getDocs(
            collection(db, "exams")
        );

        exams = [];

        examSelect.innerHTML = `
            <option value="">Select Exam</option>
        `;

        snapshot.forEach((docSnap) => {

            const data = docSnap.data();

            console.log("📚 Exam:", docSnap.id, data);

            const status = String(
                data.status || "Publish"
            ).trim().toLowerCase();

            if (status === "inactive") {
                return;
            }

            const exam = {
                id: docSnap.id,

                name:
                    data.name ||
                    data.title ||
                    data.examName ||
                    "Unnamed Exam"
            };

            exams.push(exam);

            const option =
                document.createElement("option");

            option.value = exam.id;
            option.textContent = exam.name;

            examSelect.appendChild(option);

        });

        console.log(
            `✅ ${exams.length} exam(s) loaded`
        );

    }
    catch (error) {

        console.error(
            "❌ EXAM LOAD ERROR:",
            error
        );

        alert(
            "Unable to load exams.\n\n" +
            error.message
        );
    }
}


// ==========================================================
// LOAD CATEGORIES
// ==========================================================

async function loadCategories(examId) {

    console.log(
        "🔄 Loading categories for exam:",
        examId
    );

    categorySelect.innerHTML = `
        <option value="">Loading categories...</option>
    `;

    categorySelect.disabled = true;


    if (!examId) {

        categorySelect.innerHTML = `
            <option value="">Select Category</option>
        `;

        return;
    }


    try {

        const categoriesRef =
            collection(db, "categories");


        // ==================================================
        // FIRST TRY examId QUERY
        // ==================================================

        let snapshot;

        try {

            const q = query(
                categoriesRef,
                where("examId", "==", examId)
            );

            snapshot = await getDocs(q);

            console.log(
                "📂 Categories found with examId:",
                snapshot.size
            );

        }
        catch (queryError) {

            console.warn(
                "⚠️ examId query failed:",
                queryError
            );

            snapshot =
                await getDocs(categoriesRef);
        }


        categories = [];


        categorySelect.innerHTML = `
            <option value="">Select Category</option>
        `;


        snapshot.forEach((docSnap) => {

            const data = docSnap.data();

            console.log(
                "📁 Category:",
                docSnap.id,
                data
            );


            // ------------------------------------------------
            // Check multiple possible exam fields
            // ------------------------------------------------

            const categoryExamId =
                data.examId ??
                data.examID ??
                data.exam ??
                data.exam_id ??
                "";


            // If category has exam reference,
            // make sure it belongs to selected exam.

            if (
                categoryExamId &&
                String(categoryExamId) !== String(examId)
            ) {
                return;
            }


            const category = {

                id: docSnap.id,

                name:
                    data.name ||
                    data.title ||
                    data.categoryName ||
                    "Unnamed Category"

            };


            categories.push(category);


            const option =
                document.createElement("option");


            option.value =
                category.id;


            option.textContent =
                category.name;


            categorySelect.appendChild(option);

        });


        categorySelect.disabled = false;


        console.log(
            `✅ ${categories.length} categor(y/ies) loaded`
        );


        if (categories.length === 0) {

            categorySelect.innerHTML = `
                <option value="">
                    No Category Found
                </option>
            `;

            console.warn(
                "⚠️ No categories found for selected exam."
            );
        }

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


        alert(
            "Unable to load categories.\n\n" +
            error.message
        );

    }

}


// ==========================================================
// EXAM CHANGE
// ==========================================================

examSelect.addEventListener(
    "change",
    function () {

        loadCategories(this.value);

    }
);


// ==========================================================
// SINGLE MODE
// ==========================================================

singleModeBtn.addEventListener(
    "click",
    function () {

        singleModeBtn.classList.add("active");
        bulkModeBtn.classList.remove("active");

        singleQuestionArea.classList.remove("hidden");
        bulkQuestionArea.classList.add("hidden");

    }
);


// ==========================================================
// BULK MODE
// ==========================================================

bulkModeBtn.addEventListener(
    "click",
    function () {

        bulkModeBtn.classList.add("active");
        singleModeBtn.classList.remove("active");

        bulkQuestionArea.classList.remove("hidden");
        singleQuestionArea.classList.add("hidden");

    }
);


// Upload an image to Firebase Storage and return its public download URL.
async function uploadQuestionImage(file) {
    if (!file) return "";
    if (!file.type || !file.type.startsWith("image/")) {
        throw new Error(`\"${file.name}\" is not an image file.`);
    }
    if (file.size > 5 * 1024 * 1024) {
        throw new Error(`\"${file.name}\" exceeds 5 MB. Please use a smaller image.`);
    }
    const safeName = file.name.replace(/[^a-zA-Z0-9._-]/g, "_");
    const path = `question-images/${Date.now()}_${Math.random().toString(36).slice(2)}_${safeName}`;
    const target = storageRef(storage, path);
    await uploadBytes(target, file, { contentType: file.type });
    return await getDownloadURL(target);
}

// ==========================================================
// ADD SINGLE QUESTION
// ==========================================================

addQuestionBtn.addEventListener(
    "click",
    async function () {

        const question =
            questionText.value.trim();

        const a =
            optionA.value.trim();

        const b =
            optionB.value.trim();

        const c =
            optionC.value.trim();

        const d =
            optionD.value.trim();

        const answer =
            correctAnswer.value;


        if (!question) {

            alert("Please enter question.");

            return;
        }


        if (!a || !b || !c || !d) {

            alert(
                "Please enter all four options."
            );

            return;
        }


        if (!answer) {

            alert(
                "Please select correct answer."
            );

            return;
        }


        let imageUrl = "";
        try {
            if (singleImageFile?.files?.[0]) {
                imageUrl = await uploadQuestionImage(singleImageFile.files[0]);
            }
        } catch (error) {
            alert(`Image upload failed: ${error.message}`);
            return;
        }

        questions.push({

            question: question,
            imageUrl: imageUrl,

            options: {

                A: a,
                B: b,
                C: c,
                D: d

            },

            correctAnswer: answer

        });


        clearSingleQuestion();

        renderQuestions();


        console.log(
            "✅ Single question added"
        );

    }
);


// ==========================================================
// CLEAR SINGLE QUESTION
// ==========================================================

function clearSingleQuestion() {

    questionText.value = "";

    optionA.value = "";
    optionB.value = "";
    optionC.value = "";
    optionD.value = "";

    correctAnswer.value = "";

}


// ==========================================================
// BULK QUESTIONS
// ==========================================================

parseBulkBtn.addEventListener(
    "click",
    async function () {

        const text =
            bulkQuestions.value.trim();


        if (!text) {

            alert(
                "Please paste bulk questions."
            );

            return;
        }


        console.log(
            "📥 Parsing bulk questions..."
        );


        let uploadedImages = {};
        try {
            if (bulkImageFiles?.files?.length) {
                for (const file of Array.from(bulkImageFiles.files)) {
                    uploadedImages[file.name.toLowerCase()] = await uploadQuestionImage(file);
                }
            }
        } catch (error) {
            alert(`Image upload failed: ${error.message}`);
            return;
        }

        const parsed =
            parseBulkQuestions(text, uploadedImages);


        if (parsed.length === 0) {

            alert(
                "❌ No valid questions found.\n\n" +

                "Use this format:\n\n" +

                "Q1. What is the SI unit of current?\n" +

                "A. Volt\n" +

                "B. Ampere\n" +

                "C. Ohm\n" +

                "D. Watt\n" +

                "Answer: B\n\n" +

                "Leave one blank line between questions."
            );

            return;
        }


        questions.push(...parsed);


        bulkQuestions.value = "";


        renderQuestions();


        alert(
            `✅ ${parsed.length} question(s) added successfully.`
        );


        console.log(
            "✅ Parsed questions:",
            parsed
        );

    }
);


// ==========================================================
// BULK QUESTION PARSER
//
// SUPPORTED:
//
// Q1. Question?
// A. Option A
// B. Option B
// C. Option C
// D. Option D
// Answer: B
//
// ALSO:
//
// Q1. Question?
// A. Option A
// B. Option B *
// C. Option C
// D. Option D
//
// ==========================================================

function parseBulkQuestions(text, uploadedImages = {}) {
    text = String(text || "").replace(/\r\n/g, "\n").replace(/\r/g, "\n");

    // Split only at a new numbered question. Blank lines inside a passage are preserved.
    const blocks = text.split(/(?=^\s*Q(?:uestion)?\s*\d+\s*[.):\-])/gim)
        .map(block => block.trim()).filter(Boolean);
    const result = [];

    blocks.forEach((block, blockIndex) => {
        const lines = block.split("\n");
        let questionLines = [];
        const options = { A: "", B: "", C: "", D: "" };
        let correctAnswer = "";
        let imageUrl = "";
        let seenOption = false;
        let unlabelledOptionIndex = 0;

        // Remove only the Q number prefix from the first line; retain the rest of the passage.
        lines[0] = lines[0].replace(/^\s*Q(?:uestion)?\s*\d+\s*[.):\-]\s*/i, "");

        for (const rawLine of lines) {
            const line = rawLine.trim();
            if (!line) {
                if (!seenOption && questionLines.length && questionLines[questionLines.length - 1] !== "") questionLines.push("");
                continue;
            }

            const imageMatch = line.match(/^(?:image|image\s*url|figure)\s*:\s*(.+)$/i);
            if (imageMatch) {
                const imageValue = imageMatch[1].trim();
                if (/^https?:\/\//i.test(imageValue)) imageUrl = imageValue;
                else imageUrl = uploadedImages[imageValue.toLowerCase()] || uploadedImages[imageValue.split(/[\\/]/).pop().toLowerCase()] || "";
                continue;
            }

            const answerMatch = line.match(/^(?:answer|ans|correct\s*answer)\s*[:\-]\s*([ABCD])\s*$/i);
            if (answerMatch) {
                correctAnswer = answerMatch[1].toUpperCase();
                continue;
            }

            const labelledMatch = line.match(/^(?:\(([ABCD])\)|([ABCD])\s*[.):\-])\s*(.+)$/i);
            if (labelledMatch) {
                seenOption = true;
                const key = (labelledMatch[1] || labelledMatch[2]).toUpperCase();
                let value = labelledMatch[3].trim();
                const isCorrect = /\*\s*$/.test(value);
                value = value.replace(/\s*\*\s*$/, "").trim();
                options[key] = value;
                if (isCorrect) correctAnswer = key;
                continue;
            }

            // Optional support for unlabelled A/B/C/D options after the question/passage.
            if (seenOption && unlabelledOptionIndex < 4) {
                const key = ["A", "B", "C", "D"][unlabelledOptionIndex++];
                let value = line;
                const isCorrect = /\*\s*$/.test(value);
                value = value.replace(/\s*\*\s*$/, "").trim();
                options[key] = value;
                if (isCorrect) correctAnswer = key;
                continue;
            }

            // Any non-option line remains part of the question, including multi-paragraph passages.
            questionLines.push(rawLine.trimEnd());
        }

        const question = questionLines.join("\n").trim();
        if (!question || !options.A || !options.B || !options.C || !options.D || !correctAnswer) {
            console.warn(`Question block ${blockIndex + 1} skipped: missing question, option, or correct answer.`, { question, options, correctAnswer });
            return;
        }
        result.push({ question, options, correctAnswer, imageUrl });
    });
    return result;
}


// ==========================================================
// RENDER QUESTIONS
// ==========================================================

function renderQuestions() {

    questionList.innerHTML = "";


    // ------------------------------------------------------
    // EMPTY
    // ------------------------------------------------------

    if (questions.length === 0) {

        questionList.innerHTML = `

            <div class="empty-questions">

                <div>📝</div>

                <h3>No Questions Added</h3>

                <p>
                    Add a question or import questions in bulk.
                </p>

            </div>

        `;

        updateQuestionCount();

        return;
    }


    // ------------------------------------------------------
    // QUESTIONS
    // ------------------------------------------------------

    questions.forEach(
        (item, index) => {

            const wrapper =
                document.createElement("div");


            wrapper.className =
                "question-item";


            wrapper.innerHTML = `

                <div class="question-top">

                    <div class="question-number">
                        ${index + 1}
                    </div>

                    <div class="question-text" style="white-space:pre-wrap">
                        ${escapeHTML(item.question)}
                        ${item.imageUrl ? `<img src="${escapeHTML(item.imageUrl)}" alt="Question image" style="display:block;max-width:100%;max-height:260px;object-fit:contain;margin-top:10px;border-radius:8px" onerror="this.style.display='none'">` : ""}
                    </div>

                    <button
                        type="button"
                        class="delete-question"
                        data-index="${index}"
                        title="Delete Question"
                    >
                        🗑
                    </button>

                </div>


                <div class="question-options">

                    <div class="question-option ${
                        item.correctAnswer === "A"
                            ? "correct"
                            : ""
                    }">

                        A. ${escapeHTML(item.options.A)}

                        ${
                            item.correctAnswer === "A"
                                ? " ✓"
                                : ""
                        }

                    </div>


                    <div class="question-option ${
                        item.correctAnswer === "B"
                            ? "correct"
                            : ""
                    }">

                        B. ${escapeHTML(item.options.B)}

                        ${
                            item.correctAnswer === "B"
                                ? " ✓"
                                : ""
                        }

                    </div>


                    <div class="question-option ${
                        item.correctAnswer === "C"
                            ? "correct"
                            : ""
                    }">

                        C. ${escapeHTML(item.options.C)}

                        ${
                            item.correctAnswer === "C"
                                ? " ✓"
                                : ""
                        }

                    </div>


                    <div class="question-option ${
                        item.correctAnswer === "D"
                            ? "correct"
                            : ""
                    }">

                        D. ${escapeHTML(item.options.D)}

                        ${
                            item.correctAnswer === "D"
                                ? " ✓"
                                : ""
                        }

                    </div>

                </div>

            `;


            questionList.appendChild(wrapper);

        }
    );


    // ------------------------------------------------------
    // DELETE
    // ------------------------------------------------------

    document
        .querySelectorAll(".delete-question")
        .forEach(button => {

            button.addEventListener(
                "click",
                function () {

                    const index =
                        Number(
                            this.dataset.index
                        );


                    questions.splice(
                        index,
                        1
                    );


                    renderQuestions();

                }
            );

        });


    updateQuestionCount();

}


// ==========================================================
// QUESTION COUNT
// ==========================================================

function updateQuestionCount() {

    questionCount.textContent =
        `Total Questions: ${questions.length}`;

}


// ==========================================================
// SAVE TEST
// ==========================================================

saveTestBtn.addEventListener(
    "click",
    saveTest
);


// ==========================================================
// SAVE TEST FUNCTION
// ==========================================================

async function saveTest() {

    const examId =
        examSelect.value.trim();


    const categoryId =
        categorySelect.value.trim();


    const name =
        testName.value.trim();


    const testDuration =
        Number(duration.value);


    const testPlan =
        plan.value || "free";


    // ======================================================
    // VALIDATION
    // ======================================================

    if (!examId) {

        alert(
            "Please choose an exam."
        );

        return;
    }


    if (!categoryId) {

        alert(
            "Please choose a category."
        );

        return;
    }


    if (!name) {

        alert(
            "Please enter test name."
        );

        return;
    }


    if (
        !testDuration ||
        testDuration <= 0
    ) {

        alert(
            "Please enter valid duration."
        );

        return;
    }


    if (questions.length === 0) {

        alert(
            "Please add at least one question."
        );

        return;
    }


    // ======================================================
    // GET EXAM/CATEGORY NAMES
    // ======================================================

    const selectedExam =
        exams.find(
            item =>
                item.id === examId
        );


    const selectedCategory =
        categories.find(
            item =>
                item.id === categoryId
        );


    // ======================================================
    // DISABLE BUTTON
    // ======================================================

    saveTestBtn.disabled = true;

    saveTestBtn.textContent =
        "⏳ Saving Test...";


    try {

        // ==================================================
        // CREATE TEST
        // ==================================================

        const testRef =
            await addDoc(
                collection(db, "tests"),
                {

                    examId:
                        examId,

                    examName:
                        selectedExam?.name || "",

                    categoryId:
                        categoryId,

                    categoryName:
                        selectedCategory?.name || "",

                    name:
                        name,

                    duration:
                        testDuration,

                    plan:
                        testPlan,

                    questionCount:
                        questions.length,

                    createdAt:
                        serverTimestamp()

                }
            );


        console.log(
            "✅ TEST CREATED:",
            testRef.id
        );


        // ==================================================
        // CREATE QUESTIONS
        // ==================================================

        for (
            let i = 0;
            i < questions.length;
            i++
        ) {

            const item =
                questions[i];


            await addDoc(
                collection(db, "questions"),
                {

                    testId:
                        testRef.id,

                    examId:
                        examId,

                    categoryId:
                        categoryId,

                    question:
                        item.question,

                    imageUrl:
                        item.imageUrl || "",

                    options:
                        item.options,

                    // Also save flat options
                    // for compatibility

                    A:
                        item.options.A,

                    B:
                        item.options.B,

                    C:
                        item.options.C,

                    D:
                        item.options.D,

                    correctAnswer:
                        item.correctAnswer,

                    order:
                        i + 1,

                    createdAt:
                        serverTimestamp()

                }
            );

        }


        // ==================================================
        // SUCCESS
        // ==================================================

        alert(
            `✅ Test created successfully!\n\nQuestions: ${questions.length}`
        );


        // ==================================================
        // RESET
        // ==================================================

        questions = [];


        renderQuestions();


        testName.value = "";

        duration.value = "";

        plan.value = "free";


        clearSingleQuestion();


        bulkQuestions.value = "";


        examSelect.value = "";


        categorySelect.innerHTML = `
            <option value="">
                Select Category
            </option>
        `;


        categorySelect.disabled = true;


    }
    catch (error) {

        console.error(
            "❌ SAVE TEST ERROR:",
            error
        );


        alert(
            "❌ Unable to save test.\n\n" +
            error.message
        );

    }
    finally {

        saveTestBtn.disabled = false;

        saveTestBtn.textContent =
            "💾 Save Test";

    }

}


// ==========================================================
// ESCAPE HTML
// ==========================================================

function escapeHTML(value) {

    return String(value ?? "")
        .replaceAll("&", "&amp;")
        .replaceAll("<", "&lt;")
        .replaceAll(">", "&gt;")
        .replaceAll('"', "&quot;")
        .replaceAll("'", "&#039;");

}


// ==========================================================
// BACK BUTTON
// ==========================================================

backBtn.addEventListener(
    "click",
    function () {

        window.location.href =
            "admin-dashboard-v2.html";

    }
);


// ==========================================================
// START
// ==========================================================

console.log(
    "🚀 ADD TEST V2 STARTED"
);


renderQuestions();

loadExams();