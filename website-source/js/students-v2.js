// ==========================================================
// RAJ MOCK TEST V2.0
// ADMIN STUDENT MANAGEMENT
// FIRESTORE
// ==========================================================

import { db } from "./firebase.js";

import {
    collection,
    getDocs,
    doc,
    updateDoc,
    deleteDoc
} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";


// ==========================================================
// COLLECTIONS
// ==========================================================

const STUDENTS_COLLECTION = "students";
const SUBSCRIPTIONS_COLLECTION = "subscriptions";


// ==========================================================
// ELEMENTS
// ==========================================================

const studentList =
    document.getElementById("studentList");

const loadingBox =
    document.getElementById("loadingBox");

const emptyBox =
    document.getElementById("emptyBox");

const searchInput =
    document.getElementById("searchInput");

const planFilter =
    document.getElementById("planFilter");

const statusFilter =
    document.getElementById("statusFilter");

const refreshBtn =
    document.getElementById("refreshBtn");

const totalStudents =
    document.getElementById("totalStudents");

const activeStudents =
    document.getElementById("activeStudents");

const premiumStudents =
    document.getElementById("premiumStudents");

const freeStudents =
    document.getElementById("freeStudents");


// ==========================================================
// MODAL
// ==========================================================

const studentModal =
    document.getElementById("studentModal");

const modalClose =
    document.getElementById("modalClose");

const modalAvatar =
    document.getElementById("modalAvatar");

const modalName =
    document.getElementById("modalName");

const modalDetails =
    document.getElementById("modalDetails");

const modalBlockBtn =
    document.getElementById("modalBlockBtn");

const modalDeleteBtn =
    document.getElementById("modalDeleteBtn");


// ==========================================================
// DATA
// ==========================================================

let students = [];

let subscriptions = [];

let selectedStudent = null;

let toastTimer = null;


// ==========================================================
// NORMALIZE VALUE
// ==========================================================

function normalize(value) {

    if (
        value === null ||
        value === undefined
    ) {
        return "";
    }

    return String(value)
        .trim()
        .toLowerCase();

}


// ==========================================================
// NORMALIZE MOBILE
// ==========================================================

function normalizeMobile(value) {

    if (
        value === null ||
        value === undefined
    ) {
        return "";
    }

    return String(value)
        .replace(/\D/g, "");

}


// ==========================================================
// LOAD SUBSCRIPTIONS
// ==========================================================

async function loadSubscriptions() {

    subscriptions = [];

    try {

        const snapshot =
            await getDocs(
                collection(
                    db,
                    SUBSCRIPTIONS_COLLECTION
                )
            );


        snapshot.forEach(subscriptionDoc => {

            const data =
                subscriptionDoc.data();


            subscriptions.push({

                id:
                    subscriptionDoc.id,

                ...data

            });

        });


        console.log(
            "💎 Subscriptions loaded:",
            subscriptions.length
        );


    } catch (error) {

        console.error(
            "❌ Subscription loading error:",
            error
        );

        showToast(
            "⚠️ Subscription data load नहीं हुआ."
        );

    }

}


// ==========================================================
// FIND SUBSCRIPTION
// ==========================================================

function findSubscription(student) {

    if (!student) {
        return null;
    }


    const studentId =
        normalize(student.id);

    const mobile =
        normalizeMobile(student.mobile);

    const phone =
        normalizeMobile(student.phone);

    const studentMobile =
        normalizeMobile(student.studentMobile);


    // ------------------------------------------------------
    // CHECK EVERY SUBSCRIPTION
    // ------------------------------------------------------

    for (const subscription of subscriptions) {

        const subscriptionId =
            normalize(subscription.id);

        const subscriptionMobile =
            normalizeMobile(
                subscription.mobile
            );

        const subscriptionStudentId =
            normalize(
                subscription.studentId
            );

        const subscriptionUserId =
            normalize(
                subscription.userId
            );

        const subscriptionPhone =
            normalizeMobile(
                subscription.phone
            );


        // Document ID
        if (
            studentId &&
            subscriptionId &&
            studentId === subscriptionId
        ) {

            return subscription;

        }


        // Mobile
        if (
            mobile &&
            subscriptionMobile &&
            mobile === subscriptionMobile
        ) {

            return subscription;

        }


        // Student Phone
        if (
            mobile &&
            subscriptionPhone &&
            mobile === subscriptionPhone
        ) {

            return subscription;

        }


        // Student ID
        if (
            studentId &&
            subscriptionStudentId &&
            studentId === subscriptionStudentId
        ) {

            return subscription;

        }


        // User ID
        if (
            studentId &&
            subscriptionUserId &&
            studentId === subscriptionUserId
        ) {

            return subscription;

        }


        // studentMobile
        if (
            studentMobile &&
            subscriptionMobile &&
            studentMobile === subscriptionMobile
        ) {

            return subscription;

        }

    }


    return null;

}


// ==========================================================
// LOAD STUDENTS
// ==========================================================

async function loadStudents() {

    if (loadingBox) {
        loadingBox.style.display = "block";
    }

    if (emptyBox) {
        emptyBox.style.display = "none";
    }

    if (studentList) {
        studentList.innerHTML = "";
    }


    try {

        // ==================================================
        // FIRST LOAD SUBSCRIPTIONS
        // ==================================================

        await loadSubscriptions();


        // ==================================================
        // LOAD STUDENTS
        // ==================================================

        const snapshot =
            await getDocs(
                collection(
                    db,
                    STUDENTS_COLLECTION
                )
            );


        students = [];


        snapshot.forEach(studentDoc => {

            const data =
                studentDoc.data();


            const student = {

                id:
                    studentDoc.id,

                ...data,

                mobile:
                    data.mobile ||
                    data.phone ||
                    data.studentMobile ||
                    data.mobileNumber ||
                    studentDoc.id,

                name:
                    data.name ||
                    data.studentName ||
                    data.fullName ||
                    "Student",

                email:
                    data.email ||
                    data.studentEmail ||
                    "",

                status:
                    data.status ||
                    "Active"

            };


            // ==================================================
            // FIND SUBSCRIPTION
            // ==================================================

            const subscription =
                findSubscription(student);


            if (subscription) {

                student.subscription =
                    subscription;

            }


            students.push(student);

        });


        console.log(
            "👨‍🎓 Students loaded:",
            students.length
        );


        console.log(
            "💎 Premium students:",
            students.filter(
                student =>
                    getPlan(student) === "Premium"
            ).length
        );


        if (loadingBox) {
            loadingBox.style.display = "none";
        }


        updateStats();

        renderStudents();


    } catch (error) {

        console.error(
            "❌ Students loading error:",
            error
        );


        if (loadingBox) {
            loadingBox.style.display = "none";
        }


        if (studentList) {
            studentList.innerHTML = "";
        }


        if (emptyBox) {

            emptyBox.style.display =
                "block";

            emptyBox.innerHTML = `

                <div style="font-size:40px;">
                    ⚠️
                </div>

                <h3>
                    Failed to Load Students
                </h3>

                <p>
                    ${escapeHtml(
                        error.message ||
                        "Firestore error"
                    )}
                </p>

            `;

        }


        showToast(
            "❌ Students load नहीं हो सके."
        );

    }

}


// ==========================================================
// GET PLAN
// ==========================================================

function getPlan(student) {

    const subscription =
        student.subscription;


    // ======================================================
    // SUBSCRIPTION PREMIUM
    // ======================================================

    if (subscription) {

        const currentPlan =
            normalize(
                subscription.currentPlan ||
                subscription.plan ||
                subscription.type
            );


        const expiry =
            subscription.expiry ||
            subscription.expiryDate ||
            subscription.expiresAt;


        if (
            currentPlan === "premium"
        ) {

            // अगर expiry मौजूद है और expired है
            if (
                expiry &&
                isExpired(expiry)
            ) {

                return "Free";

            }


            return "Premium";

        }

    }


    // ======================================================
    // STUDENT DOCUMENT PREMIUM
    // ======================================================

    const studentPlan =
        normalize(
            student.plan ||
            student.currentPlan
        );


    if (
        studentPlan === "premium"
    ) {

        const expiry =
            student.expiryDate ||
            student.expiry ||
            student.premiumExpiry;


        if (
            expiry &&
            isExpired(expiry)
        ) {

            return "Free";

        }


        return "Premium";

    }


    return "Free";

}


// ==========================================================
// GET STATUS
// ==========================================================

function getStatus(student) {

    const status =
        normalize(
            student.status ||
            "Active"
        );


    if (
        status === "blocked" ||
        status === "inactive" ||
        status === "disabled"
    ) {

        return "Blocked";

    }


    return "Active";

}


// ==========================================================
// STATS
// ==========================================================

function updateStats() {

    const total =
        students.length;


    let active = 0;

    let premium = 0;

    let free = 0;


    students.forEach(student => {

        if (
            getStatus(student) === "Active"
        ) {

            active++;

        }


        if (
            getPlan(student) === "Premium"
        ) {

            premium++;

        } else {

            free++;

        }

    });


    if (totalStudents) {
        totalStudents.textContent =
            total;
    }

    if (activeStudents) {
        activeStudents.textContent =
            active;
    }

    if (premiumStudents) {
        premiumStudents.textContent =
            premium;
    }

    if (freeStudents) {
        freeStudents.textContent =
            free;
    }


    console.log(
        `📊 Total: ${total} | Active: ${active} | Premium: ${premium} | Free: ${free}`
    );

}


// ==========================================================
// FILTER
// ==========================================================

function getFilteredStudents() {

    const search =
        searchInput
            ? searchInput.value
                .trim()
                .toLowerCase()
            : "";


    const selectedPlan =
        planFilter
            ? planFilter.value
            : "All";


    const selectedStatus =
        statusFilter
            ? statusFilter.value
            : "All";


    return students.filter(student => {

        const plan =
            getPlan(student);


        const status =
            getStatus(student);


        const searchText = [

            student.name,

            student.mobile,

            student.email,

            student.id

        ]
            .filter(Boolean)
            .join(" ")
            .toLowerCase();


        const searchMatch =
            !search ||
            searchText.includes(search);


        const planMatch =
            selectedPlan === "All" ||
            plan === selectedPlan;


        const statusMatch =
            selectedStatus === "All" ||
            status === selectedStatus;


        return (
            searchMatch &&
            planMatch &&
            statusMatch
        );

    });

}


// ==========================================================
// RENDER
// ==========================================================

function renderStudents() {

    if (!studentList) {
        return;
    }


    studentList.innerHTML = "";


    const filtered =
        getFilteredStudents();


    if (!filtered.length) {

        if (emptyBox) {

            emptyBox.style.display =
                "block";

        }

        return;

    }


    if (emptyBox) {

        emptyBox.style.display =
            "none";

    }


    filtered.forEach(student => {

        studentList.appendChild(
            createStudentCard(student)
        );

    });

}


// ==========================================================
// CREATE STUDENT CARD
// ==========================================================

function createStudentCard(student) {

    const card =
        document.createElement("div");


    card.className =
        "student-card";


    const name =
        student.name ||
        "Student";


    const initial =
        name
            .charAt(0)
            .toUpperCase();


    const mobile =
        student.mobile ||
        "-";


    const email =
        student.email ||
        "-";


    const plan =
        getPlan(student);


    const status =
        getStatus(student);


    const subscription =
        student.subscription ||
        {};


    const expiry =
        subscription.expiry ||
        subscription.expiryDate ||
        subscription.expiresAt ||
        student.expiryDate ||
        student.expiry ||
        student.premiumExpiry ||
        "";


    let expiryText =
        "-";


    let expiryClass =
        "";


    if (expiry) {

        expiryText =
            formatDate(expiry);


        if (
            isExpired(expiry)
        ) {

            expiryClass =
                "expiry-expired";

        } else {

            expiryClass =
                "expiry-active";

        }

    }


    card.innerHTML = `

        <div class="student-top">

            <div class="student-info">

                <div class="avatar">

                    ${escapeHtml(initial)}

                </div>

                <div>

                    <h3>
                        ${escapeHtml(name)}
                    </h3>

                    <p>
                        📱 ${escapeHtml(
                            String(mobile)
                        )}
                    </p>

                </div>

            </div>


            <span class="
                plan-badge
                ${
                    plan === "Premium"
                        ? "plan-premium"
                        : "plan-free"
                }
            ">

                ${
                    plan === "Premium"
                        ? "💎 Premium"
                        : "🆓 Free"
                }

            </span>

        </div>


        <div class="student-details">

            <div class="detail-row">

                <span>
                    Email
                </span>

                <strong>
                    ${escapeHtml(email)}
                </strong>

            </div>


            <div class="detail-row">

                <span>
                    Status
                </span>

                <strong class="
                    status-badge
                    ${
                        status === "Active"
                            ? "status-active"
                            : "status-blocked"
                    }
                ">

                    ${
                        status === "Active"
                            ? "🟢 Active"
                            : "🔴 Blocked"
                    }

                </strong>

            </div>


            <div class="detail-row">

                <span>
                    Premium Expiry
                </span>

                <strong class="${expiryClass}">

                    ${escapeHtml(expiryText)}

                </strong>

            </div>

        </div>


        <div class="student-actions">

            <button
                class="view-btn"
                data-action="view"
                data-id="${escapeHtml(student.id)}"
            >

                👁️ View

            </button>


            ${
                status === "Active"

                ?

                `
                <button
                    class="block-card-btn"
                    data-action="block"
                    data-id="${escapeHtml(student.id)}"
                >

                    🔒 Block

                </button>
                `

                :

                `
                <button
                    class="unblock-card-btn"
                    data-action="unblock"
                    data-id="${escapeHtml(student.id)}"
                >

                    🔓 Unblock

                </button>
                `
            }

        </div>

    `;


    return card;

}


// ==========================================================
// VIEW STUDENT
// ==========================================================

function openStudentModal(student) {

    if (!studentModal) {
        return;
    }


    selectedStudent =
        student;


    const name =
        student.name ||
        "Student";


    if (modalAvatar) {

        modalAvatar.textContent =
            name
                .charAt(0)
                .toUpperCase();

    }


    if (modalName) {

        modalName.textContent =
            name;

    }


    const plan =
        getPlan(student);


    const status =
        getStatus(student);


    const subscription =
        student.subscription ||
        {};


    const expiry =
        subscription.expiry ||
        subscription.expiryDate ||
        subscription.expiresAt ||
        student.expiryDate ||
        student.expiry ||
        student.premiumExpiry ||
        "";


    if (modalDetails) {

        modalDetails.innerHTML = `

            <div class="modal-row">

                <span>
                    Student ID
                </span>

                <strong>
                    ${escapeHtml(
                        student.id || "-"
                    )}
                </strong>

            </div>


            <div class="modal-row">

                <span>
                    Mobile
                </span>

                <strong>
                    ${escapeHtml(
                        String(
                            student.mobile || "-"
                        )
                    )}
                </strong>

            </div>


            <div class="modal-row">

                <span>
                    Email
                </span>

                <strong>
                    ${escapeHtml(
                        student.email || "-"
                    )}
                </strong>

            </div>


            <div class="modal-row">

                <span>
                    Plan
                </span>

                <strong>

                    ${
                        plan === "Premium"
                            ? "💎 Premium"
                            : "🆓 Free"
                    }

                </strong>

            </div>


            <div class="modal-row">

                <span>
                    Status
                </span>

                <strong>

                    ${
                        status === "Active"
                            ? "🟢 Active"
                            : "🔴 Blocked"
                    }

                </strong>

            </div>


            <div class="modal-row">

                <span>
                    Premium Expiry
                </span>

                <strong>
                    ${escapeHtml(
                        formatDate(expiry)
                    )}
                </strong>

            </div>

        `;

    }


    if (modalBlockBtn) {

        modalBlockBtn.textContent =
            status === "Active"
                ? "🔒 Block Student"
                : "🔓 Unblock Student";

    }


    studentModal.classList.add(
        "show"
    );

}


// ==========================================================
// BLOCK / UNBLOCK
// ==========================================================

async function changeStudentStatus(
    student,
    newStatus
) {

    if (!student) {
        return;
    }


    const action =
        newStatus === "Blocked"
            ? "Block"
            : "Unblock";


    if (
        !confirm(
            `${action} ${student.name || "this student"}?`
        )
    ) {

        return;

    }


    try {

        await updateDoc(

            doc(
                db,
                STUDENTS_COLLECTION,
                student.id
            ),

            {
                status:
                    newStatus
            }

        );


        student.status =
            newStatus;


        updateStats();

        renderStudents();


        if (
            selectedStudent &&
            selectedStudent.id === student.id
        ) {

            openStudentModal(student);

        }


        showToast(

            newStatus === "Blocked"

                ? "🔒 Student blocked."

                : "🔓 Student unblocked."

        );


    } catch (error) {

        console.error(
            "❌ Status update error:",
            error
        );


        showToast(
            "❌ Student status update नहीं हो सका."
        );

    }

}


// ==========================================================
// DELETE STUDENT
// ==========================================================

async function deleteStudent(student) {

    if (!student) {
        return;
    }


    const confirmDelete =
        confirm(
            `⚠️ Delete ${student.name || "this student"} permanently?`
        );


    if (!confirmDelete) {
        return;
    }


    try {

        await deleteDoc(

            doc(
                db,
                STUDENTS_COLLECTION,
                student.id
            )

        );


        students =
            students.filter(
                item =>
                    item.id !== student.id
            );


        selectedStudent =
            null;


        if (studentModal) {

            studentModal.classList.remove(
                "show"
            );

        }


        updateStats();

        renderStudents();


        showToast(
            "🗑️ Student deleted."
        );


    } catch (error) {

        console.error(
            "❌ Delete error:",
            error
        );


        showToast(
            "❌ Student delete नहीं हो सका."
        );

    }

}


// ==========================================================
// CARD EVENTS
// ==========================================================

if (studentList) {

    studentList.addEventListener(
        "click",
        event => {

            const button =
                event.target.closest(
                    "button[data-action]"
                );


            if (!button) {
                return;
            }


            const id =
                button.dataset.id;


            const action =
                button.dataset.action;


            const student =
                students.find(
                    item =>
                        String(item.id) ===
                        String(id)
                );


            if (!student) {
                return;
            }


            if (action === "view") {

                openStudentModal(student);

            }


            if (action === "block") {

                changeStudentStatus(
                    student,
                    "Blocked"
                );

            }


            if (action === "unblock") {

                changeStudentStatus(
                    student,
                    "Active"
                );

            }

        }
    );

}


// ==========================================================
// MODAL BLOCK
// ==========================================================

if (modalBlockBtn) {

    modalBlockBtn.addEventListener(
        "click",
        () => {

            if (!selectedStudent) {
                return;
            }


            const newStatus =
                getStatus(selectedStudent) === "Active"

                    ? "Blocked"

                    : "Active";


            changeStudentStatus(
                selectedStudent,
                newStatus
            );

        }
    );

}


// ==========================================================
// MODAL DELETE
// ==========================================================

if (modalDeleteBtn) {

    modalDeleteBtn.addEventListener(
        "click",
        () => {

            deleteStudent(
                selectedStudent
            );

        }
    );

}


// ==========================================================
// CLOSE MODAL
// ==========================================================

function closeModal() {

    if (studentModal) {

        studentModal.classList.remove(
            "show"
        );

    }


    selectedStudent =
        null;

}


if (modalClose) {

    modalClose.addEventListener(
        "click",
        closeModal
    );

}


if (studentModal) {

    studentModal.addEventListener(
        "click",
        event => {

            if (
                event.target ===
                studentModal
            ) {

                closeModal();

            }

        }
    );

}


// ==========================================================
// FILTER EVENTS
// ==========================================================

if (searchInput) {

    searchInput.addEventListener(
        "input",
        renderStudents
    );

}


if (planFilter) {

    planFilter.addEventListener(
        "change",
        renderStudents
    );

}


if (statusFilter) {

    statusFilter.addEventListener(
        "change",
        renderStudents
    );

}


if (refreshBtn) {

    refreshBtn.addEventListener(
        "click",
        loadStudents
    );

}


// ==========================================================
// LOGOUT
// ==========================================================

const logoutBtn =
    document.getElementById(
        "logoutBtn"
    );


if (logoutBtn) {

    logoutBtn.addEventListener(
        "click",
        event => {

            event.preventDefault();


            if (
                confirm(
                    "Do you want to Logout?"
                )
            ) {

                sessionStorage.clear();

                window.location.href =
                    "index.html";

            }

        }
    );

}


// ==========================================================
// TOAST
// ==========================================================

function showToast(message) {

    const toast =
        document.getElementById(
            "toast"
        );


    const toastMessage =
        document.getElementById(
            "toastMessage"
        );


    if (!toast || !toastMessage) {
        return;
    }


    toastMessage.textContent =
        message;


    toast.classList.add(
        "show"
    );


    clearTimeout(
        toastTimer
    );


    toastTimer =
        setTimeout(
            () => {

                toast.classList.remove(
                    "show"
                );

            },
            3000
        );

}


// ==========================================================
// DATE EXPIRED
// ==========================================================

function isExpired(value) {

    if (!value) {
        return false;
    }


    try {

        let date;


        if (
            value &&
            typeof value.toDate ===
            "function"
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

            return false;

        }


        return (
            date.getTime() <
            Date.now()
        );

    }

    catch {

        return false;

    }

}


// ==========================================================
// FORMAT DATE
// ==========================================================

function formatDate(value) {

    if (
        !value ||
        value === "-"
    ) {

        return "-";

    }


    try {

        let date;


        if (
            value &&
            typeof value.toDate ===
            "function"
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


        return date.toLocaleDateString(
            "en-IN",
            {
                day: "2-digit",
                month: "short",
                year: "numeric"
            }
        );

    }

    catch {

        return "-";

    }

}


// ==========================================================
// ESCAPE HTML
// ==========================================================

function escapeHtml(value) {

    return String(value)

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
    "🚀 Raj Mock Test V2.0 Student Management Started"
);


loadStudents();