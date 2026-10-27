// ==========================================================
// RAJ MOCK TEST V2.0
// STUDENT TEST ENGINE
// CATEGORY + TEST + PREMIUM ACCESS
// FIRESTORE
// ==========================================================

import { db } from "./firebase.js";

import {
    collection,
    getDocs,
    query,
    where,
    doc,
    getDoc
} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";


// ==========================================================
// ELEMENTS
// ==========================================================

const categoryGrid =
    document.getElementById("categoryGrid");

const testGrid =
    document.getElementById("testGrid");

const categorySection =
    document.getElementById("categorySection");

const testSection =
    document.getElementById("testSection");

const searchInput =
    document.getElementById("searchInput");

const examNameElement =
    document.getElementById("examName");

const breadcrumbExam =
    document.getElementById("breadcrumbExam");

const breadcrumbCategoryWrap =
    document.getElementById("breadcrumbCategoryWrap");

const breadcrumbCategory =
    document.getElementById("breadcrumbCategory");

const testHeading =
    document.getElementById("testHeading");


// ==========================================================
// SELECTED EXAM
// ==========================================================

const selectedExamId =
    localStorage.getItem("selectedExam");

const selectedExamName =
    localStorage.getItem("selectedExamName") ||
    "Exam";


console.log(
    "🔥 SELECTED EXAM ID:",
    selectedExamId
);

console.log(
    "🔥 SELECTED EXAM NAME:",
    selectedExamName
);


// ==========================================================
// CHECK EXAM
// ==========================================================

if (!selectedExamId) {

    alert(
        "⚠️ Please select an exam first."
    );

    window.location.href =
        "student-dashboard-v2.html";

    throw new Error(
        "selectedExam missing"
    );
}


// ==========================================================
// STATE
// ==========================================================

let allCategories = [];

let selectedCategory = null;

let currentTests = [];


// ==========================================================
// STUDENT SUBSCRIPTION STATE
// ==========================================================

let studentMobile = "";

let isPremiumStudent = false;

let subscriptionData = null;


// ==========================================================
// GET STUDENT MOBILE
// ==========================================================

function getStudentMobile() {

    const mobile =
        localStorage.getItem("studentMobile") ||
        sessionStorage.getItem("studentMobile") ||
        "";

    return String(mobile).trim();
}


// ==========================================================
// LOAD STUDENT
// ==========================================================

function loadStudent() {

    const name =
        localStorage.getItem("studentName") ||
        sessionStorage.getItem("studentName") ||
        "Student";


    const studentName =
        document.getElementById(
            "studentName"
        );


    const studentAvatar =
        document.getElementById(
            "studentAvatar"
        );


    if (studentName) {

        studentName.textContent =
            name;

    }


    if (studentAvatar) {

        studentAvatar.textContent =
            name
                .charAt(0)
                .toUpperCase();

    }

}


// ==========================================================
// SUBSCRIPTION DATE CHECK
// ==========================================================

function isSubscriptionExpired(expiryDate) {

    if (!expiryDate) {

        return true;

    }


    try {

        let expiry;


        // Firestore Timestamp
        if (
            typeof expiryDate.toDate ===
            "function"
        ) {

            expiry =
                expiryDate.toDate();

        }

        // JavaScript Date
        else if (
            expiryDate instanceof Date
        ) {

            expiry =
                expiryDate;

        }

        // Timestamp-like object
        else if (
            expiryDate.seconds
        ) {

            expiry =
                new Date(
                    Number(
                        expiryDate.seconds
                    ) * 1000
                );

        }

        // String / number
        else {

            expiry =
                new Date(
                    expiryDate
                );

        }


        if (
            isNaN(
                expiry.getTime()
            )
        ) {

            console.warn(
                "⚠️ Invalid expiryDate:",
                expiryDate
            );

            return true;

        }


        const now =
            new Date();


        console.log(
            "📅 Subscription expiry:",
            expiry
        );

        console.log(
            "📅 Current date:",
            now
        );


        return expiry.getTime() <
            now.getTime();

    }
    catch (error) {

        console.error(
            "❌ Expiry date check error:",
            error
        );

        return true;

    }

}


// ==========================================================
// LOAD STUDENT SUBSCRIPTION
// ==========================================================

async function loadSubscription() {

    studentMobile =
        getStudentMobile();


    console.log(
        "📱 STUDENT MOBILE:",
        studentMobile
    );


    // ------------------------------------------------------
    // No mobile
    // ------------------------------------------------------

    if (!studentMobile) {

        console.warn(
            "⚠️ Student mobile not found."
        );

        isPremiumStudent =
            false;

        return;

    }


    try {

        // ==================================================
        // subscriptions/{mobile}
        // ==================================================

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


        if (
            !subscriptionSnap.exists()
        ) {

            console.log(
                "🆓 No subscription found."
            );

            subscriptionData =
                null;

            isPremiumStudent =
                false;

            return;

        }


        subscriptionData =
            subscriptionSnap.data();


        console.log(
            "💎 SUBSCRIPTION DATA:",
            subscriptionData
        );


        // ==================================================
        // PLAN
        // ==================================================

        const plan =
            String(
                subscriptionData.plan ||
                ""
            )
            .trim()
            .toLowerCase();


        // ==================================================
        // STATUS
        // ==================================================

        const status =
            String(
                subscriptionData.status ||
                ""
            )
            .trim()
            .toLowerCase();


        // ==================================================
        // EXPIRY
        // ==================================================

        const expiryDate =
            subscriptionData.expiryDate;


        const expired =
            isSubscriptionExpired(
                expiryDate
            );


        console.log(
            "💎 PLAN:",
            plan
        );

        console.log(
            "💎 STATUS:",
            status
        );

        console.log(
            "💎 EXPIRED:",
            expired
        );


        // ==================================================
        // FINAL PREMIUM CHECK
        // ==================================================

        isPremiumStudent =
            (
                plan === "premium" &&
                (
                    status === "active" ||
                    status === "approved"
                ) &&
                !expired
            );


        if (
            isPremiumStudent
        ) {

            console.log(
                "✅ PREMIUM ACCESS ACTIVE"
            );

        }
        else {

            console.log(
                "🔒 PREMIUM ACCESS NOT ACTIVE"
            );

        }

    }
    catch (error) {

        console.error(
            "❌ SUBSCRIPTION ERROR:",
            error
        );

        isPremiumStudent =
            false;

    }

}


// ==========================================================
// EXAM NAME
// ==========================================================

if (examNameElement) {

    examNameElement.textContent =
        selectedExamName;

}


if (breadcrumbExam) {

    breadcrumbExam.textContent =
        selectedExamName;

}


// ==========================================================
// LOAD CATEGORIES
// ==========================================================

async function loadCategories() {

    showCategoryLoading();


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
                    selectedExamId
                )
            );


        const snapshot =
            await getDocs(q);


        allCategories = [];


        console.log(
            "🔥 CATEGORY DOCUMENTS:",
            snapshot.size
        );


        snapshot.forEach(
            docSnap => {

                const data =
                    docSnap.data();


                console.log(
                    "📂 CATEGORY:",
                    docSnap.id,
                    data
                );


                const status =
                    String(
                        data.status ||
                        "Publish"
                    )
                    .trim()
                    .toLowerCase();


                if (
                    status ===
                    "inactive"
                ) {

                    return;

                }


                allCategories.push({

                    id:
                        docSnap.id,

                    name:
                        data.name ||
                        data.title ||
                        "Unnamed Category",

                    icon:
                        data.icon ||
                        "📂",

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


        allCategories.sort(
            (a, b) =>
                a.order - b.order
        );


        console.log(
            "✅ CATEGORIES:",
            allCategories
        );


        renderCategories(
            allCategories
        );

    }
    catch (error) {

        console.error(
            "❌ CATEGORY ERROR:",
            error
        );


        showCategoryError(
            error.message
        );

    }

}


// ==========================================================
// RENDER CATEGORIES
// ==========================================================

function renderCategories(
    categories
) {

    if (!categoryGrid) {

        return;

    }


    categoryGrid.innerHTML =
        "";


    const categoryCount =
        document.getElementById(
            "categoryCount"
        );


    if (categoryCount) {

        categoryCount.textContent =
            categories.length;

    }


    if (
        categories.length ===
        0
    ) {

        categoryGrid.innerHTML = `

            <div class="empty-box">

                <div class="empty-icon">
                    📂
                </div>

                <h3>
                    No Categories Available
                </h3>

                <p>
                    No category is linked
                    with ${escapeHTML(
                        selectedExamName
                    )}.
                </p>

            </div>

        `;

        return;

    }


    categories.forEach(
        category => {

            const card =
                document.createElement(
                    "div"
                );


            card.className =
                "category-card";


            card.innerHTML = `

                <div class="category-icon">
                    ${escapeHTML(
                        category.icon
                    )}
                </div>

                <h3>
                    ${escapeHTML(
                        category.name
                    )}
                </h3>

                <p>
                    ${escapeHTML(
                        category.description
                    )}
                </p>

                <div class="category-arrow">
                    →
                </div>

            `;


            card.addEventListener(
                "click",
                () =>
                    openCategory(
                        category
                    )
            );


            categoryGrid.appendChild(
                card
            );

        }
    );

}


// ==========================================================
// OPEN CATEGORY
// ==========================================================

async function openCategory(
    category
) {

    selectedCategory =
        category;


    console.log(
        "===================================="
    );

    console.log(
        "📂 CATEGORY SELECTED"
    );

    console.log(
        "CATEGORY ID:",
        category.id
    );

    console.log(
        "CATEGORY NAME:",
        category.name
    );

    console.log(
        "===================================="
    );


    localStorage.setItem(
        "selectedCategory",
        category.id
    );


    localStorage.setItem(
        "selectedCategoryName",
        category.name
    );


    if (
        breadcrumbCategoryWrap
    ) {

        breadcrumbCategoryWrap.style.display =
            "inline";

    }


    if (
        breadcrumbCategory
    ) {

        breadcrumbCategory.textContent =
            category.name;

    }


    if (
        categorySection
    ) {

        categorySection.style.display =
            "none";

    }


    if (
        testSection
    ) {

        testSection.style.display =
            "block";

    }


    if (searchInput) {

        searchInput.value =
            "";

    }


    if (testHeading) {

        testHeading.textContent =
            `${category.name} Tests`;

    }


    await loadTests(
        category.id
    );

}


// ==========================================================
// LOAD TESTS
// ==========================================================

async function loadTests(
    categoryId
) {

    showTestLoading();


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


        console.log(
            "🔥 TESTS FOUND:",
            snapshot.size
        );


        snapshot.forEach(
            docSnap => {

                const data =
                    docSnap.data();


                console.log(
                    "📝 TEST:",
                    docSnap.id,
                    data
                );


                const status =
                    String(
                        data.status ||
                        "Publish"
                    )
                    .trim()
                    .toLowerCase();


                if (
                    status ===
                    "inactive"
                ) {

                    return;

                }


                const plan =
                    String(
                        data.plan ||
                        "Free"
                    )
                    .trim()
                    .toLowerCase();


                currentTests.push({

                    id:
                        docSnap.id,

                    title:
                        data.name ||
                        data.title ||
                        "Mock Test",

                    description:
                        data.description ||
                        data.subject ||
                        "Practice Test",

                    duration:
                        Number(
                            data.time ||
                            data.duration ||
                            60
                        ),

                    totalQuestions:
                        Number(
                            data.total ||
                            data.totalQuestions ||
                            0
                        ),

                    plan:
                        plan,

                    subject:
                        data.subject ||
                        "",

                    order:
                        Number(
                            data.order ||
                            999
                        )

                });

            }
        );


        currentTests.sort(
            (a, b) =>
                a.order - b.order
        );


        console.log(
            "✅ CURRENT TESTS:",
            currentTests
        );


        renderTests(
            currentTests
        );

    }
    catch (error) {

        console.error(
            "❌ TEST ERROR:",
            error
        );


        showTestError(
            error.message
        );

    }

}


// ==========================================================
// CHECK TEST ACCESS
// ==========================================================

function canOpenTest(test) {

    if (!test) {

        return false;

    }


    const plan =
        String(
            test.plan ||
            "free"
        )
        .trim()
        .toLowerCase();


    // ------------------------------------------------------
    // FREE TEST
    // ------------------------------------------------------

    if (
        plan !== "premium"
    ) {

        return true;

    }


    // ------------------------------------------------------
    // PREMIUM TEST
    // ------------------------------------------------------

    if (
        isPremiumStudent
    ) {

        return true;

    }


    return false;

}


// ==========================================================
// RENDER TESTS
// ==========================================================

function renderTests(
    tests
) {

    if (!testGrid) {

        return;

    }


    testGrid.innerHTML =
        "";


    if (
        tests.length ===
        0
    ) {

        testGrid.innerHTML = `

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

            const card =
                document.createElement(
                    "div"
                );


            card.className =
                "test-card";


            const premium =
                test.plan ===
                "premium";


            const accessible =
                canOpenTest(
                    test
                );


            // ------------------------------------------------
            // CARD
            // ------------------------------------------------

            card.innerHTML = `

                <div class="test-icon">

                    ${
                        premium
                        ? "💎"
                        : "📝"
                    }

                </div>

                <div class="test-content">

                    <h3>
                        ${escapeHTML(
                            test.title
                        )}
                    </h3>

                    <p class="test-description">
                        ${escapeHTML(
                            test.description
                        )}
                    </p>

                    <div class="test-meta">

                        <span>
                            ⏱ ${test.duration} Min
                        </span>

                        <span>
                            📝 ${
                                test.totalQuestions ||
                                "Questions"
                            }
                        </span>

                        <span>

                            ${
                                premium
                                ? "💎 Premium"
                                : "🆓 Free"
                            }

                        </span>

                    </div>

                </div>

                <button
                    type="button"
                    class="start-btn
                    ${
                        !accessible
                        ? "locked"
                        : ""
                    }"
                >

                    ${
                        accessible
                        ? "Start →"
                        : "🔒 Premium"
                    }

                </button>

            `;


            const button =
                card.querySelector(
                    ".start-btn"
                );


            // ------------------------------------------------
            // LOCKED TEST
            // ------------------------------------------------

            if (
                !accessible
            ) {

                button.disabled =
                    false;


                button.addEventListener(
                    "click",
                    event => {

                        event.preventDefault();

                        event.stopPropagation();


                        showPremiumMessage();

                    }
                );

            }

            // ------------------------------------------------
            // OPEN TEST
            // ------------------------------------------------

            else {

                button.addEventListener(
                    "click",
                    event => {

                        event.preventDefault();

                        event.stopPropagation();


                        startTest(
                            test
                        );

                    }
                );

            }


            testGrid.appendChild(
                card
            );

        }
    );

}


// ==========================================================
// PREMIUM MESSAGE
// ==========================================================

function showPremiumMessage() {

    if (
        isPremiumStudent
    ) {

        return;

    }


    alert(
        "🔒 This is a Premium Test.\n\n" +
        "Please activate a Premium subscription " +
        "to access this test."
    );

}


// ==========================================================
// START TEST
// ==========================================================

function startTest(
    test
) {

    if (
        !test ||
        !test.id
    ) {

        alert(
            "⚠️ Test ID missing."
        );

        return;

    }


    if (
        !selectedCategory
    ) {

        alert(
            "⚠️ Category not selected."
        );

        return;

    }


    // ======================================================
    // FINAL PREMIUM SECURITY CHECK
    // ======================================================

    if (
        test.plan ===
        "premium" &&
        !isPremiumStudent
    ) {

        console.warn(
            "🔒 PREMIUM TEST BLOCKED:",
            test.id
        );


        showPremiumMessage();


        return;

    }


    console.log(
        "===================================="
    );

    console.log(
        "🚀 START TEST"
    );

    console.log(
        "TEST ID:",
        test.id
    );

    console.log(
        "TEST NAME:",
        test.title
    );

    console.log(
        "TEST PLAN:",
        test.plan
    );

    console.log(
        "PREMIUM STUDENT:",
        isPremiumStudent
    );

    console.log(
        "CATEGORY ID:",
        selectedCategory.id
    );

    console.log(
        "===================================="
    );


    // ======================================================
    // CLEAR OLD RESULT
    // ======================================================

    localStorage.removeItem(
        "latestResult"
    );

    localStorage.removeItem(
        "lastResult"
    );


    // ======================================================
    // SAVE TEST
    // ======================================================

    localStorage.setItem(
        "selectedTest",
        test.id
    );


    localStorage.setItem(
        "selectedTestName",
        test.title
    );


    localStorage.setItem(
        "selectedTestDuration",
        String(
            test.duration
        )
    );


    localStorage.setItem(
        "selectedTestPlan",
        test.plan
    );


    localStorage.setItem(
        "selectedCategory",
        selectedCategory.id
    );


    localStorage.setItem(
        "selectedCategoryName",
        selectedCategory.name
    );


    // ======================================================
    // OPEN EXAM
    // ======================================================

    window.location.href =
        "exam-v2.html";

}


// ==========================================================
// SEARCH
// ==========================================================

if (searchInput) {

    searchInput.addEventListener(
        "input",
        function () {

            const value =
                this.value
                    .toLowerCase()
                    .trim();


            if (
                testSection &&
                testSection.style.display !==
                "none"
            ) {

                filterTestCards(
                    value
                );

            }
            else {

                const filtered =
                    allCategories.filter(
                        category =>

                            category.name
                                .toLowerCase()
                                .includes(
                                    value
                                )

                            ||

                            category.description
                                .toLowerCase()
                                .includes(
                                    value
                                )
                    );


                renderCategories(
                    filtered
                );

            }

        }
    );

}


// ==========================================================
// FILTER TESTS
// ==========================================================

function filterTestCards(
    value
) {

    const cards =
        document.querySelectorAll(
            ".test-card"
        );


    cards.forEach(
        card => {

            const text =
                card.textContent
                    .toLowerCase();


            card.style.display =
                text.includes(
                    value
                )
                ? ""
                : "none";

        }
    );

}


// ==========================================================
// CHANGE CATEGORY
// ==========================================================

const changeCategoryBtn =
    document.getElementById(
        "changeCategoryBtn"
    );


if (
    changeCategoryBtn
) {

    changeCategoryBtn.onclick =
        showCategories;

}


// ==========================================================
// SHOW CATEGORIES
// ==========================================================

function showCategories() {

    selectedCategory =
        null;


    if (testSection) {

        testSection.style.display =
            "none";

    }


    if (categorySection) {

        categorySection.style.display =
            "block";

    }


    if (
        breadcrumbCategoryWrap
    ) {

        breadcrumbCategoryWrap.style.display =
            "none";

    }


    if (searchInput) {

        searchInput.value =
            "";

    }


    renderCategories(
        allCategories
    );

}


// ==========================================================
// HOME
// ==========================================================

function goHome() {

    window.location.href =
        "student-dashboard-v2.html";

}


const backBtn =
    document.getElementById(
        "backBtn"
    );


if (backBtn) {

    backBtn.onclick =
        goHome;

}


const homeBtn =
    document.getElementById(
        "homeBtn"
    );


if (homeBtn) {

    homeBtn.onclick =
        goHome;

}


const navHome =
    document.getElementById(
        "navHome"
    );


if (navHome) {

    navHome.onclick =
        goHome;

}


// ==========================================================
// RESULTS
// ==========================================================

const navResults =
    document.getElementById(
        "navResults"
    );


if (navResults) {

    navResults.onclick =
        () => {

            window.location.href =
                "my-results-v2.html";

        };

}


// ==========================================================
// LOADING
// ==========================================================

function showCategoryLoading() {

    if (!categoryGrid) {

        return;

    }


    categoryGrid.innerHTML = `

        <div class="loading-box">

            <div class="loader"></div>

            <p>
                Loading categories...
            </p>

        </div>

    `;

}


function showTestLoading() {

    if (!testGrid) {

        return;

    }


    testGrid.innerHTML = `

        <div class="loading-box">

            <div class="loader"></div>

            <p>
                Loading tests...
            </p>

        </div>

    `;

}


// ==========================================================
// ERRORS
// ==========================================================

function showCategoryError(
    message
) {

    if (!categoryGrid) {

        return;

    }


    categoryGrid.innerHTML = `

        <div class="empty-box">

            <div class="empty-icon">
                ⚠️
            </div>

            <h3>
                Category Loading Error
            </h3>

            <p>
                ${escapeHTML(
                    message ||
                    "Unable to load categories."
                )}
            </p>

        </div>

    `;

}


function showTestError(
    message
) {

    if (!testGrid) {

        return;

    }


    testGrid.innerHTML = `

        <div class="empty-box">

            <div class="empty-icon">
                ⚠️
            </div>

            <h3>
                Test Loading Error
            </h3>

            <p>
                ${escapeHTML(
                    message ||
                    "Unable to load tests."
                )}
            </p>

        </div>

    `;

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
// START APPLICATION
// ==========================================================

async function startApplication() {

    console.log(
        "🚀 RAJ MOCK TEST V2.0 STARTING..."
    );


    // ------------------------------------------------------
    // Student UI
    // ------------------------------------------------------

    loadStudent();


    // ------------------------------------------------------
    // Subscription FIRST
    // ------------------------------------------------------

    await loadSubscription();


    console.log(
        "💎 FINAL PREMIUM STATUS:",
        isPremiumStudent
    );


    // ------------------------------------------------------
    // Categories
    // ------------------------------------------------------

    await loadCategories();

}


// ==========================================================
// START
// ==========================================================

startApplication();