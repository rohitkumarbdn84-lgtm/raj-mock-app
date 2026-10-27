// ==========================================================
// RAJ MOCK TEST V2.0
// EXAM ENGINE - SECURED PREMIUM VERSION
// FIRESTORE QUESTIONS + FIRESTORE RESULTS
// PREMIUM ACCESS VALIDATION
// ==========================================================

import { db } from "./firebase.js";

import {
    doc,
    getDoc,
    collection,
    getDocs,
    query,
    where,
    addDoc
} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";


// ==========================================================
// ELEMENTS
// ==========================================================

const testTitle = document.getElementById("testTitle");
const timer = document.getElementById("timer");
const timerBox = document.getElementById("timerBox");

const questionNumber =
    document.getElementById("questionNumber");

const progressText =
    document.getElementById("progressText");

const progressFill =
    document.getElementById("progressFill");

const questionText =
    document.getElementById("questionText");

const optionsContainer =
    document.getElementById("optionsContainer");

const previousBtn =
    document.getElementById("previousBtn");

const nextBtn =
    document.getElementById("nextBtn");

const markBtn =
    document.getElementById("markBtn");

const totalQuestions =
    document.getElementById("totalQuestions");

const questionPalette =
    document.getElementById("questionPalette");

const answeredCount =
    document.getElementById("answeredCount");

const markedCount =
    document.getElementById("markedCount");

const remainingCount =
    document.getElementById("remainingCount");

const submitModal =
    document.getElementById("submitModal");

const modalAnswered =
    document.getElementById("modalAnswered");

const modalRemaining =
    document.getElementById("modalRemaining");


// ==========================================================
// SELECTED TEST
// ==========================================================

const selectedTestId =
    localStorage.getItem("selectedTest");

console.log(
    "🔥 SELECTED TEST:",
    selectedTestId
);

if (!selectedTestId) {

    alert("⚠️ Test is not selected.");

    window.location.href =
        "student-tests-v2.html";

    throw new Error(
        "selectedTest missing"
    );
}


// ==========================================================
// STUDENT INFORMATION
// ==========================================================

const studentMobile =
    String(
        localStorage.getItem("studentMobile") ||
        sessionStorage.getItem("studentMobile") ||
        ""
    ).trim();

const studentId =
    String(
        localStorage.getItem("studentId") ||
        sessionStorage.getItem("studentId") ||
        ""
    ).trim();

const studentName =
    localStorage.getItem("studentName") ||
    sessionStorage.getItem("studentName") ||
    "Student";

console.log(
    "👤 STUDENT:",
    {
        studentId,
        studentMobile,
        studentName
    }
);


// ==========================================================
// STATE
// ==========================================================

let test = null;

let questions = [];

let currentQuestion = 0;

let userAnswers = [];

let markedQuestions = [];

let remainingSeconds = 0;

let timerInterval = null;

let submitted = false;


// ==========================================================
// SUBSCRIPTION STATE
// ==========================================================

let subscription = {

    plan: "Free",

    status: "inactive",

    expiryDate: null,

    isPremium: false
};


// ==========================================================
// MAIN LOAD
// ==========================================================

async function loadTest() {

    try {

        showLoading();


        // ==================================================
        // STEP 1
        // LOAD TEST
        // ==================================================

        const testRef =
            doc(
                db,
                "tests",
                selectedTestId
            );

        const testSnap =
            await getDoc(testRef);


        if (!testSnap.exists()) {

            throw new Error(
                "Test document not found in Firebase."
            );
        }


        const data =
            testSnap.data();


        // ==================================================
        // TEST INFORMATION
        // ==================================================

        test = {

            id:
                testSnap.id,

            title:
                data.name ||
                data.title ||
                localStorage.getItem(
                    "selectedTestName"
                ) ||
                "Mock Test",

            duration:
                Number(
                    data.time ||
                    data.duration ||
                    localStorage.getItem(
                        "selectedTestDuration"
                    ) ||
                    60
                ),

            total:
                Number(
                    data.total ||
                    data.totalQuestions ||
                    0
                ),

            plan:
                String(
                    data.plan || "Free"
                )
                    .trim()
                    .toLowerCase(),

            categoryId:
                data.categoryId ||
                localStorage.getItem(
                    "selectedCategory"
                ) ||
                "",

            categoryName:
                data.categoryName ||
                localStorage.getItem(
                    "selectedCategoryName"
                ) ||
                ""
        };


        console.log(
            "📚 TEST INFORMATION:",
            test
        );


        // ==================================================
        // STEP 2
        // PREMIUM ACCESS CHECK
        // ==================================================

        const accessAllowed =
            await checkTestAccess();


        if (!accessAllowed) {

            return;
        }


        // ==================================================
        // STEP 3
        // LOAD QUESTIONS
        // ==================================================

        await loadQuestions();


        if (
            questions.length === 0
        ) {

            throw new Error(
                "No questions found for this test."
            );
        }


        // ==================================================
        // STEP 4
        // INITIALIZE ANSWERS
        // ==================================================

        userAnswers =
            new Array(
                questions.length
            ).fill(null);

        markedQuestions =
            new Array(
                questions.length
            ).fill(false);


        remainingSeconds =
            test.duration * 60;


        // ==================================================
        // STEP 5
        // UPDATE UI
        // ==================================================

        if (testTitle) {

            testTitle.textContent =
                test.title;
        }


        if (totalQuestions) {

            totalQuestions.textContent =
                questions.length;
        }


        // ==================================================
        // CREATE PALETTE
        // ==================================================

        createPalette();


        // ==================================================
        // LOAD FIRST QUESTION
        // ==================================================

        loadQuestion();


        // ==================================================
        // START TIMER
        // ==================================================

        startTimer();

    }

    catch (error) {

        console.error(
            "❌ EXAM ERROR:",
            error
        );

        showError(
            error.message
        );
    }
}


// ==========================================================
// CHECK TEST ACCESS
// ==========================================================

async function checkTestAccess() {

    try {

        // --------------------------------------------------
        // FREE TEST
        // --------------------------------------------------

        if (
            test.plan !== "premium"
        ) {

            console.log(
                "🟢 FREE TEST - ACCESS ALLOWED"
            );

            return true;
        }


        // --------------------------------------------------
        // PREMIUM TEST
        // --------------------------------------------------

        console.log(
            "🔐 PREMIUM TEST - CHECKING SUBSCRIPTION"
        );


        // --------------------------------------------------
        // STUDENT MOBILE REQUIRED
        // --------------------------------------------------

        if (!studentMobile) {

            showPremiumLocked(
                "Student information not found. Please login again."
            );

            return false;
        }


        // --------------------------------------------------
        // LOAD SUBSCRIPTION
        // subscriptions/{studentMobile}
        // --------------------------------------------------

        const subscriptionRef =
            doc(
                db,
                "subscriptions",
                studentMobile
            );


        const subscriptionSnap =
            await getDoc(
                subscriptionRef
            );


        // --------------------------------------------------
        // NO SUBSCRIPTION
        // --------------------------------------------------

        if (
            !subscriptionSnap.exists()
        ) {

            console.log(
                "🔒 NO SUBSCRIPTION FOUND"
            );

            subscription = {

                plan: "Free",

                status: "inactive",

                expiryDate: null,

                isPremium: false
            };


            showPremiumLocked(
                "This is a Premium test. Please activate a Premium subscription to continue."
            );

            return false;
        }


        // --------------------------------------------------
        // SUBSCRIPTION DATA
        // --------------------------------------------------

        const data =
            subscriptionSnap.data();


        const plan =
            String(
                data.plan || "Free"
            )
                .trim()
                .toLowerCase();


        const status =
            String(
                data.status || "inactive"
            )
                .trim()
                .toLowerCase();


        const expiryDate =
            data.expiryDate ||
            data.expiry ||
            data.validTill ||
            null;


        const expired =
            isSubscriptionExpired(
                expiryDate
            );


        const validStatus =
            status === "active" ||
            status === "approved";


        const isPremium =
            plan === "premium" &&
            validStatus &&
            !expired;


        subscription = {

            plan,

            status,

            expiryDate,

            isPremium
        };


        console.log(
            "🔐 SUBSCRIPTION:",
            {
                plan,
                status,
                expiryDate,
                expired,
                isPremium
            }
        );


        // --------------------------------------------------
        // PREMIUM ACCESS
        // --------------------------------------------------

        if (isPremium) {

            console.log(
                "✅ PREMIUM ACCESS GRANTED"
            );

            return true;
        }


        // --------------------------------------------------
        // EXPIRED
        // --------------------------------------------------

        if (expired) {

            showPremiumLocked(
                "Your Premium subscription has expired. Please renew your subscription to continue."
            );

            return false;
        }


        // --------------------------------------------------
        // INVALID / INACTIVE
        // --------------------------------------------------

        showPremiumLocked(
            "Your Premium subscription is not active. Please activate your Premium plan to continue."
        );

        return false;

    }

    catch (error) {

        console.error(
            "❌ SUBSCRIPTION CHECK ERROR:",
            error
        );


        showPremiumLocked(
            "Unable to verify Premium subscription. Please login again and try."
        );


        return false;
    }
}


// ==========================================================
// CHECK SUBSCRIPTION EXPIRY
// ==========================================================

function isSubscriptionExpired(
    expiryDate
) {

    if (!expiryDate) {

        // No expiry date means invalid
        return true;
    }


    try {

        let expiry;


        // --------------------------------------------------
        // FIRESTORE TIMESTAMP
        // --------------------------------------------------

        if (
            expiryDate &&
            typeof expiryDate.toDate === "function"
        ) {

            expiry =
                expiryDate.toDate();
        }


        // --------------------------------------------------
        // JAVASCRIPT DATE
        // --------------------------------------------------

        else if (
            expiryDate instanceof Date
        ) {

            expiry =
                expiryDate;
        }


        // --------------------------------------------------
        // FIRESTORE TIMESTAMP-LIKE OBJECT
        // --------------------------------------------------

        else if (
            typeof expiryDate === "object" &&
            expiryDate.seconds !== undefined
        ) {

            expiry =
                new Date(
                    Number(
                        expiryDate.seconds
                    ) * 1000
                );
        }


        // --------------------------------------------------
        // NUMBER
        // --------------------------------------------------

        else if (
            typeof expiryDate === "number"
        ) {

            expiry =
                new Date(
                    expiryDate < 10000000000
                        ? expiryDate * 1000
                        : expiryDate
                );
        }


        // --------------------------------------------------
        // STRING
        // --------------------------------------------------

        else {

            expiry =
                new Date(
                    String(
                        expiryDate
                    ).trim()
                );
        }


        if (
            !expiry ||
            Number.isNaN(
                expiry.getTime()
            )
        ) {

            console.warn(
                "⚠️ Invalid expiryDate:",
                expiryDate
            );

            return true;
        }


        return (
            expiry.getTime() <=
            Date.now()
        );

    }

    catch (error) {

        console.error(
            "❌ EXPIRY CHECK ERROR:",
            error
        );

        return true;
    }
}


// ==========================================================
// PREMIUM LOCK SCREEN
// ==========================================================

function showPremiumLocked(
    message
) {

    submitted = true;


    if (timerInterval) {

        clearInterval(
            timerInterval
        );

        timerInterval = null;
    }


    if (testTitle) {

        testTitle.textContent =
            "Premium Test";
    }


    if (questionNumber) {

        questionNumber.textContent =
            "🔒 Premium";
    }


    if (progressText) {

        progressText.textContent =
            "Premium Access Required";
    }


    if (optionsContainer) {

        optionsContainer.innerHTML = `

            <div
                style="
                    text-align:center;
                    padding:45px 25px;
                    max-width:600px;
                    margin:auto;
                "
            >

                <div
                    style="
                        font-size:60px;
                        margin-bottom:15px;
                    "
                >
                    🔒
                </div>

                <h2
                    style="
                        margin:0 0 12px;
                    "
                >
                    Premium Test
                </h2>

                <p
                    style="
                        line-height:1.6;
                        margin-bottom:25px;
                    "
                >
                    ${escapeHTML(message)}
                </p>

                <button
                    id="premiumBackBtn"
                    type="button"
                    style="
                        padding:12px 24px;
                        border:0;
                        border-radius:8px;
                        cursor:pointer;
                        font-size:15px;
                        font-weight:600;
                    "
                >
                    ← Back to Tests
                </button>

            </div>
        `;
    }


    if (previousBtn) {

        previousBtn.style.display =
            "none";
    }


    if (nextBtn) {

        nextBtn.style.display =
            "none";
    }


    if (markBtn) {

        markBtn.style.display =
            "none";
    }


    if (questionPalette) {

        questionPalette.innerHTML =
            "";
    }


    const backBtn =
        document.getElementById(
            "premiumBackBtn"
        );


    if (backBtn) {

        backBtn.onclick =
            goBack;
    }
}


// ==========================================================
// LOAD QUESTIONS
// ==========================================================

async function loadQuestions() {

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
                selectedTestId
            )
        );


    const snapshot =
        await getDocs(q);


    questions = [];


    console.log(
        "🔥 QUESTIONS FOUND:",
        snapshot.size
    );


    snapshot.forEach(
        docSnap => {

            const data =
                docSnap.data();


            // ==================================================
            // OPTIONS
            // Supports:
            //
            // A/B/C/D fields
            // options array
            // options object
            // ==================================================

            const options =
                getQuestionOptions(
                    data
                );


            // ==================================================
            // CORRECT ANSWER
            // ==================================================

            const rawCorrectAnswer =
                data.correctAnswer ??
                data.answer ??
                data.correct ??
                data.correctOption ??
                "";


            const normalizedAnswer =
                normalizeAnswer(
                    rawCorrectAnswer,
                    options
                );


            const questionObject = {

                id:
                    docSnap.id,

                question:
                    data.question ||
                    data.questionText ||
                    data.text ||
                    "",

                imageUrl:
                    data.imageUrl || data.image || data.imageURL || "",

                options,

                answer:
                    normalizedAnswer,

                rawAnswer:
                    rawCorrectAnswer,

                marks:
                    Number(
                        data.marks || 1
                    ),

                order:
                    Number(
                        data.order ??
                        data.questionNo ??
                        data.questionNumber ??
                        999
                    )
            };


            questions.push(
                questionObject
            );


            console.log(
                "📝 QUESTION:",
                {
                    id:
                        questionObject.id,

                    question:
                        questionObject.question,

                    rawCorrectAnswer,

                    normalizedAnswer,

                    options
                }
            );
        }
    );


    // ==================================================
    // SORT
    // ==================================================

    questions.sort(
        (a, b) =>
            a.order - b.order
    );


    console.log(
        "✅ FINAL QUESTIONS:",
        questions
    );


    // ==================================================
    // CHECK INVALID ANSWERS
    // ==================================================

    const invalidAnswers =
        questions.filter(
            q =>
                q.answer < 0 ||
                q.answer > 3
        );


    if (
        invalidAnswers.length > 0
    ) {

        console.warn(
            "⚠️ QUESTIONS WITH INVALID CORRECT ANSWER:",
            invalidAnswers
        );
    }
}


// ==========================================================
// GET QUESTION OPTIONS
// ==========================================================

function getQuestionOptions(
    data
) {

    // ------------------------------------------------------
    // OPTIONS ARRAY
    // ------------------------------------------------------

    if (
        Array.isArray(
            data.options
        )
    ) {

        return [
            data.options[0] ?? "",
            data.options[1] ?? "",
            data.options[2] ?? "",
            data.options[3] ?? ""
        ];
    }


    // ------------------------------------------------------
    // OPTIONS OBJECT
    // ------------------------------------------------------

    if (
        data.options &&
        typeof data.options === "object"
    ) {

        return [

            data.options.A ??
            data.options.a ??
            "",

            data.options.B ??
            data.options.b ??
            "",

            data.options.C ??
            data.options.c ??
            "",

            data.options.D ??
            data.options.d ??
            ""
        ];
    }


    // ------------------------------------------------------
    // OLD FORMAT
    // A/B/C/D
    // ------------------------------------------------------

    return [

        data.A ??
        data.a ??
        "",

        data.B ??
        data.b ??
        "",

        data.C ??
        data.c ??
        "",

        data.D ??
        data.d ??
        ""
    ];
}


// ==========================================================
// ANSWER NORMALIZER
// ==========================================================
//
// Supports:
//
// A / B / C / D
// 1 / 2 / 3 / 4
// 0 / 1 / 2 / 3
// Option text
// A. Option text
// B. Option text
// etc.
//
// ==========================================================

function normalizeAnswer(
    answer,
    options = []
) {

    // ------------------------------------------------------
    // EMPTY
    // ------------------------------------------------------

    if (
        answer === null ||
        answer === undefined ||
        String(answer).trim() === ""
    ) {

        return -1;
    }


    // ------------------------------------------------------
    // NUMBER
    // ------------------------------------------------------

    if (
        typeof answer === "number"
    ) {

        // 0 = first option
        if (answer === 0) {

            return 0;
        }

        // 1-4 = option number
        if (
            answer >= 1 &&
            answer <= 4
        ) {

            return answer - 1;
        }

        return -1;
    }


    // ------------------------------------------------------
    // STRING
    // ------------------------------------------------------

    if (
        typeof answer === "string"
    ) {

        let value =
            answer
                .trim()
                .toUpperCase();


        // --------------------------------------------------
        // REMOVE MARKS
        // --------------------------------------------------

        value =
            value
                .replace(/\*/g, "")
                .trim();


        // --------------------------------------------------
        // A / B / C / D
        // --------------------------------------------------

        if (value === "A") return 0;
        if (value === "B") return 1;
        if (value === "C") return 2;
        if (value === "D") return 3;


        // --------------------------------------------------
        // A. / B. / C. / D.
        // --------------------------------------------------

        if (/^A[.)]$/.test(value)) return 0;
        if (/^B[.)]$/.test(value)) return 1;
        if (/^C[.)]$/.test(value)) return 2;
        if (/^D[.)]$/.test(value)) return 3;


        // --------------------------------------------------
        // 1 / 2 / 3 / 4
        // --------------------------------------------------

        if (value === "1") return 0;
        if (value === "2") return 1;
        if (value === "3") return 2;
        if (value === "4") return 3;


        // --------------------------------------------------
        // OPTION TEXT EXACT MATCH
        // --------------------------------------------------

        for (
            let i = 0;
            i < options.length;
            i++
        ) {

            const optionText =
                String(
                    options[i] ?? ""
                )
                    .trim()
                    .toUpperCase();


            if (
                optionText &&
                optionText === value
            ) {

                return i;
            }
        }


        // --------------------------------------------------
        // "A. Ampere"
        // "B. Voltage"
        // --------------------------------------------------

        const letters =
            ["A", "B", "C", "D"];


        for (
            let i = 0;
            i < options.length;
            i++
        ) {

            const optionText =
                String(
                    options[i] ?? ""
                )
                    .trim()
                    .toUpperCase();


            const fullOption =
                `${letters[i]}. ${optionText}`;


            const fullOptionBracket =
                `${letters[i]}) ${optionText}`;


            if (
                value === fullOption ||
                value === fullOptionBracket
            ) {

                return i;
            }
        }


        // --------------------------------------------------
        // VALUE STARTS WITH A/B/C/D
        // Example:
        // A. AMPERE
        // B. VOLT
        // --------------------------------------------------

        const letterMatch =
            value.match(
                /^([ABCD])[.)]\s*(.*)$/i
            );


        if (letterMatch) {

            const letter =
                letterMatch[1];

            const text =
                letterMatch[2]
                    .trim();


            const index =
                letters.indexOf(
                    letter
                );


            if (
                index >= 0
            ) {

                const optionText =
                    String(
                        options[index] ?? ""
                    )
                        .trim()
                        .toUpperCase();


                if (
                    text ===
                    optionText
                ) {

                    return index;
                }
            }
        }
    }


    return -1;
}


// ==========================================================
// LOADING
// ==========================================================

function showLoading() {

    if (questionText) {

        questionText.textContent =
            "Loading Questions...";
    }


    if (optionsContainer) {

        optionsContainer.innerHTML = `

            <div
                style="
                    text-align:center;
                    padding:30px;
                "
            >
                ⏳ Loading questions...
            </div>
        `;
    }
}


// ==========================================================
// ERROR
// ==========================================================

function showError(
    message
) {

    if (questionText) {

        questionText.textContent =
            "Unable to Load Test";
    }


    if (!optionsContainer) {
        return;
    }


    optionsContainer.innerHTML = `

        <div
            style="
                text-align:center;
                padding:30px;
            "
        >

            <div
                style="
                    font-size:45px;
                "
            >
                ⚠️
            </div>

            <h3>
                Test Loading Error
            </h3>

            <p>
                ${escapeHTML(message)}
            </p>

            <button
                id="errorBackBtn"
                type="button"
                style="
                    margin-top:15px;
                    padding:10px 20px;
                    border:0;
                    border-radius:8px;
                    cursor:pointer;
                "
            >
                ← Back to Tests
            </button>

        </div>
    `;


    const btn =
        document.getElementById(
            "errorBackBtn"
        );


    if (btn) {

        btn.onclick =
            goBack;
    }
}


// ==========================================================
// TIMER
// ==========================================================

function startTimer() {

    updateTimer();


    timerInterval =
        setInterval(
            () => {

                if (submitted) {

                    clearInterval(
                        timerInterval
                    );

                    return;
                }


                remainingSeconds--;

                updateTimer();


                if (
                    remainingSeconds <= 0
                ) {

                    clearInterval(
                        timerInterval
                    );

                    autoSubmit();
                }

            },
            1000
        );
}


// ==========================================================
// UPDATE TIMER
// ==========================================================

function updateTimer() {

    if (
        !timer ||
        !timerBox
    ) {

        return;
    }


    const minutes =
        Math.floor(
            remainingSeconds / 60
        );


    const seconds =
        remainingSeconds % 60;


    timer.textContent =
        `${String(minutes).padStart(2, "0")}:${String(seconds).padStart(2, "0")}`;


    timerBox.classList.remove(
        "timer-warning",
        "timer-danger"
    );


    if (
        remainingSeconds <= 300
    ) {

        timerBox.classList.add(
            "timer-warning"
        );
    }


    if (
        remainingSeconds <= 60
    ) {

        timerBox.classList.add(
            "timer-danger"
        );
    }
}


// ==========================================================
// LOAD QUESTION
// ==========================================================

function loadQuestion() {

    const question =
        questions[
            currentQuestion
        ];


    if (!question) {
        return;
    }


    // ------------------------------------------------------
    // QUESTION NUMBER
    // ------------------------------------------------------

    if (questionNumber) {

        questionNumber.textContent =
            `Question ${currentQuestion + 1}`;
    }


    // ------------------------------------------------------
    // PROGRESS TEXT
    // ------------------------------------------------------

    if (progressText) {

        progressText.textContent =
            `${currentQuestion + 1} / ${questions.length}`;
    }


    // ------------------------------------------------------
    // TOTAL
    // ------------------------------------------------------

    if (totalQuestions) {

        totalQuestions.textContent =
            questions.length;
    }


    // ------------------------------------------------------
    // QUESTION TEXT
    // ------------------------------------------------------

    if (questionText) {
        questionText.textContent = question.question || "";
        questionText.style.whiteSpace = "pre-wrap";
        questionText.querySelectorAll("img.question-attached-image").forEach(img => img.remove());
        if (question.imageUrl) {
            const image = document.createElement("img");
            image.className = "question-attached-image";
            image.src = question.imageUrl;
            image.alt = "Question diagram";
            image.loading = "lazy";
            image.style.cssText = "display:block;max-width:100%;max-height:360px;object-fit:contain;margin:14px auto 4px;border-radius:8px";
            image.onerror = () => image.remove();
            questionText.appendChild(image);
        }
    }


    if (!optionsContainer) {
        return;
    }


    optionsContainer.innerHTML =
        "";


    const letters =
        ["A", "B", "C", "D"];


    question.options.forEach(
        (option, index) => {

            const optionElement =
                document.createElement(
                    "div"
                );


            optionElement.className =
                "option";


            // ------------------------------------------------
            // SELECTED
            // ------------------------------------------------

            if (
                userAnswers[
                    currentQuestion
                ] === index
            ) {

                optionElement.classList.add(
                    "selected"
                );
            }


            optionElement.innerHTML = `

                <div
                    class="option-letter"
                >
                    ${letters[index]}
                </div>

                <div
                    class="option-text"
                >
                    ${escapeHTML(option)}
                </div>
            `;


            optionElement.onclick =
                () => {

                    selectAnswer(
                        index
                    );
                };


            optionsContainer.appendChild(
                optionElement
            );
        }
    );


    // ------------------------------------------------------
    // MARK BUTTON
    // ------------------------------------------------------

    if (markBtn) {

        markBtn.classList.toggle(
            "active",
            markedQuestions[
                currentQuestion
            ]
        );


        markBtn.textContent =
            markedQuestions[
                currentQuestion
            ]

                ? "🔖 Marked for Review"

                : "🔖 Mark for Review";
    }


    // ------------------------------------------------------
    // PREVIOUS
    // ------------------------------------------------------

    if (previousBtn) {

        previousBtn.disabled =
            currentQuestion === 0;
    }


    // ------------------------------------------------------
    // NEXT
    // ------------------------------------------------------

    if (nextBtn) {

        nextBtn.textContent =
            currentQuestion ===
            questions.length - 1

                ? "Finish →"

                : "Next →";
    }


    updateProgress();

    updatePalette();

    updateSummary();
}


// ==========================================================
// SELECT ANSWER
// ==========================================================

function selectAnswer(
    index
) {

    if (submitted) {
        return;
    }


    userAnswers[
        currentQuestion
    ] = index;


    loadQuestion();
}


// ==========================================================
// NEXT
// ==========================================================

function nextQuestion() {

    if (
        currentQuestion <
        questions.length - 1
    ) {

        currentQuestion++;

        loadQuestion();

    }

    else {

        confirmSubmit();
    }
}


// ==========================================================
// PREVIOUS
// ==========================================================

function previousQuestion() {

    if (
        currentQuestion > 0
    ) {

        currentQuestion--;

        loadQuestion();
    }
}


// ==========================================================
// MARK
// ==========================================================

function toggleMark() {

    if (submitted) {
        return;
    }


    markedQuestions[
        currentQuestion
    ] =
        !markedQuestions[
            currentQuestion
        ];


    loadQuestion();
}


// ==========================================================
// PALETTE
// ==========================================================

function createPalette() {

    if (!questionPalette) {
        return;
    }


    questionPalette.innerHTML =
        "";


    questions.forEach(
        (question, index) => {

            const button =
                document.createElement(
                    "button"
                );


            button.type =
                "button";


            button.className =
                "question-number";


            button.textContent =
                index + 1;


            button.onclick =
                () => {

                    if (submitted) {
                        return;
                    }


                    currentQuestion =
                        index;


                    loadQuestion();
                };


            questionPalette.appendChild(
                button
            );
        }
    );
}


// ==========================================================
// UPDATE PALETTE
// ==========================================================

function updatePalette() {

    const buttons =
        document.querySelectorAll(
            ".question-number"
        );


    buttons.forEach(
        (button, index) => {

            button.classList.remove(
                "answered",
                "marked",
                "current"
            );


            if (
                userAnswers[index] !==
                null
            ) {

                button.classList.add(
                    "answered"
                );
            }


            if (
                markedQuestions[index]
            ) {

                button.classList.add(
                    "marked"
                );
            }


            if (
                index ===
                currentQuestion
            ) {

                button.classList.add(
                    "current"
                );
            }
        }
    );
}


// ==========================================================
// PROGRESS
// ==========================================================

function updateProgress() {

    if (!progressFill) {
        return;
    }


    const answered =
        userAnswers.filter(
            answer =>
                answer !== null
        ).length;


    const percentage =
        questions.length > 0

            ? (
                answered /
                questions.length
            ) * 100

            : 0;


    progressFill.style.width =
        `${percentage}%`;
}


// ==========================================================
// SUMMARY
// ==========================================================

function updateSummary() {

    const answered =
        userAnswers.filter(
            answer =>
                answer !== null
        ).length;


    const marked =
        markedQuestions.filter(
            value =>
                value === true
        ).length;


    const remaining =
        questions.length -
        answered;


    if (answeredCount) {

        answeredCount.textContent =
            answered;
    }


    if (markedCount) {

        markedCount.textContent =
            marked;
    }


    if (remainingCount) {

        remainingCount.textContent =
            remaining;
    }
}


// ==========================================================
// CONFIRM SUBMIT
// ==========================================================

function confirmSubmit() {

    if (submitted) {
        return;
    }


    const answered =
        userAnswers.filter(
            answer =>
                answer !== null
        ).length;


    const remaining =
        questions.length -
        answered;


    if (modalAnswered) {

        modalAnswered.textContent =
            answered;
    }


    if (modalRemaining) {

        modalRemaining.textContent =
            remaining;
    }


    if (submitModal) {

        submitModal.classList.add(
            "show"
        );
    }
}


// ==========================================================
// CLOSE MODAL
// ==========================================================

function closeModal() {

    if (submitModal) {

        submitModal.classList.remove(
            "show"
        );
    }
}


// ==========================================================
// AUTO SUBMIT
// ==========================================================

function autoSubmit() {

    if (submitted) {
        return;
    }


    alert(
        "⏱️ Time is over!"
    );


    submitTest();
}


// ==========================================================
// SUBMIT TEST
// ==========================================================

async function submitTest() {

    if (submitted) {
        return;
    }


    submitted = true;


    clearInterval(
        timerInterval
    );


    try {

        // ==================================================
        // FINAL RESULT
        // ==================================================

        const result =
            calculateResult();


        console.log(
            "📊 FINAL RESULT:",
            result
        );


        // ==================================================
        // STUDENT ID
        // ==================================================

        const resultStudentId =
            localStorage.getItem(
                "studentId"
            ) ||

            sessionStorage.getItem(
                "studentId"
            ) ||

            localStorage.getItem(
                "studentMobile"
            ) ||

            sessionStorage.getItem(
                "studentMobile"
            ) ||

            "";


        const resultStudentName =
            localStorage.getItem(
                "studentName"
            ) ||

            sessionStorage.getItem(
                "studentName"
            ) ||

            "Student";


        // ==================================================
        // FIRESTORE RESULT
        // ==================================================

        const firestoreResult = {

            studentId:
                String(
                    resultStudentId
                ).trim(),

            studentName:
                resultStudentName,

            studentMobile:
                studentMobile,

            testId:
                result.testId,

            testName:
                result.testName,

            categoryId:
                result.categoryId,

            categoryName:
                result.categoryName,

            total:
                result.total,

            correct:
                result.correct,

            wrong:
                result.wrong,

            unattempted:
                result.unattempted,

            score:
                result.score,

            percentage:
                result.percentage,

            timeTaken:
                result.timeTaken,

            duration:
                result.duration,

            userAnswers:
                result.userAnswers,

            correctAnswers:
                result.correctAnswers,

            answerDetails:
                result.answerDetails,

            submittedAtISO:
                result.submittedAt
        };


        console.log(
            "📤 SAVING RESULT:",
            firestoreResult
        );


        const resultsRef =
            collection(
                db,
                "results"
            );


        const savedResult =
            await addDoc(
                resultsRef,
                firestoreResult
            );


        console.log(
            "✅ RESULT SAVED:",
            savedResult.id
        );


        result.resultId =
            savedResult.id;


        // ==================================================
        // LOCAL STORAGE
        // ==================================================

        localStorage.setItem(
            "latestResult",
            JSON.stringify(result)
        );


        localStorage.setItem(
            "lastResult",
            JSON.stringify(result)
        );


        // ==================================================
        // RESULT PAGE
        // ==================================================

        window.location.href =
            "result-v2.html";
    }

    catch (error) {

        console.error(
            "❌ RESULT SAVE ERROR:",
            error
        );


        submitted = false;


        alert(
            "❌ Result save nahi ho paya.\n\n" +
            error.message
        );
    }
}


// ==========================================================
// CALCULATE RESULT
// ==========================================================

function calculateResult() {

    let correct = 0;

    let wrong = 0;

    let unattempted = 0;


    const answerDetails = [];


    questions.forEach(
        (question, index) => {

            const selected =
                userAnswers[index];


            const correctAnswer =
                question.answer;


            // ==================================================
            // UNATTEMPTED
            // ==================================================

            if (
                selected === null ||
                selected === undefined
            ) {

                unattempted++;


                answerDetails.push({

                    questionIndex:
                        index,

                    questionId:
                        question.id,

                    selected:
                        null,

                    correct:
                        correctAnswer,

                    status:
                        "unattempted"
                });


                return;
            }


            // ==================================================
            // CORRECT
            // ==================================================

            if (
                Number(selected) ===
                Number(correctAnswer)
            ) {

                correct++;


                answerDetails.push({

                    questionIndex:
                        index,

                    questionId:
                        question.id,

                    selected:
                        selected,

                    correct:
                        correctAnswer,

                    status:
                        "correct"
                });
            }


            // ==================================================
            // WRONG
            // ==================================================

            else {

                wrong++;


                answerDetails.push({

                    questionIndex:
                        index,

                    questionId:
                        question.id,

                    selected:
                        selected,

                    correct:
                        correctAnswer,

                    status:
                        "wrong"
                });
            }
        }
    );


    const total =
        questions.length;


    const percentage =
        total > 0

            ? Math.round(
                (
                    correct /
                    total
                ) * 100
            )

            : 0;


    const timeTaken =
        (
            test.duration * 60
        ) -
        remainingSeconds;


    // ==================================================
    // DEBUG
    // ==================================================

    console.table(
        answerDetails
    );


    console.log(
        "✅ CORRECT:",
        correct
    );


    console.log(
        "❌ WRONG:",
        wrong
    );


    console.log(
        "⭕ UNATTEMPTED:",
        unattempted
    );


    console.log(
        "📊 TOTAL:",
        total
    );


    console.log(
        "📈 PERCENTAGE:",
        percentage
    );


    return {

        testId:
            selectedTestId,

        testName:
            test.title,

        categoryId:
            test.categoryId ||
            localStorage.getItem(
                "selectedCategory"
            ) ||
            "",

        categoryName:
            test.categoryName ||
            localStorage.getItem(
                "selectedCategoryName"
            ) ||
            "",

        total,

        correct,

        wrong,

        unattempted,

        score:
            correct,

        percentage,

        timeTaken,

        duration:
            test.duration,

        userAnswers:
            [...userAnswers],

        correctAnswers:
            questions.map(
                question =>
                    question.answer
            ),

        answerDetails,

        submittedAt:
            new Date().toISOString()
    };
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
// BACK
// ==========================================================

function goBack() {

    window.location.href =
        "student-tests-v2.html";
}


// ==========================================================
// GLOBAL FUNCTIONS
// ==========================================================

window.toggleMark =
    toggleMark;

window.previousQuestion =
    previousQuestion;

window.nextQuestion =
    nextQuestion;

window.confirmSubmit =
    confirmSubmit;

window.closeModal =
    closeModal;

window.submitTest =
    submitTest;

window.goBack =
    goBack;


// ==========================================================
// START
// ==========================================================

console.log(
    "🚀 RAJ MOCK TEST V2.0 SECURED EXAM ENGINE STARTED"
);


loadTest();