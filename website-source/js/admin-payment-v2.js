// ==========================================================
// RAJ MOCK TEST V2.0
// ADMIN PAYMENT APPROVAL
// FIRESTORE
// ==========================================================

import { db } from "./firebase.js";

import {
    collection,
    getDocs,
    doc,
    updateDoc,
    setDoc,
    getDoc,
    serverTimestamp
} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";


// ==========================================================
// CONFIG
// ==========================================================

const PAYMENT_COLLECTION = "paymentRequests";
const SUBSCRIPTION_COLLECTION = "subscriptions";


// ==========================================================
// ELEMENTS
// ==========================================================

const paymentList =
    document.getElementById("paymentList");

const loadingBox =
    document.getElementById("loadingBox");

const emptyBox =
    document.getElementById("emptyBox");

const statusFilter =
    document.getElementById("statusFilter");

const searchInput =
    document.getElementById("searchInput");

const refreshBtn =
    document.getElementById("refreshBtn");

const pendingCount =
    document.getElementById("pendingCount");

const approvedCount =
    document.getElementById("approvedCount");

const rejectedCount =
    document.getElementById("rejectedCount");


// ==========================================================
// MODALS
// ==========================================================

const approvalModal =
    document.getElementById("approvalModal");

const rejectModal =
    document.getElementById("rejectModal");

const approvalDetails =
    document.getElementById("approvalDetails");

const rejectReason =
    document.getElementById("rejectReason");

let selectedPayment = null;


// ==========================================================
// DATA
// ==========================================================

let paymentRequests = [];


// ==========================================================
// LOAD PAYMENTS
// IMPORTANT:
// No Firestore orderBy() used.
// This supports OLD + NEW payment documents.
// ==========================================================

async function loadPayments() {

    try {

        loadingBox.style.display = "block";
        emptyBox.style.display = "none";

        paymentList.innerHTML = "";


        const snapshot =
            await getDocs(
                collection(
                    db,
                    PAYMENT_COLLECTION
                )
            );


        paymentRequests = [];


        snapshot.forEach((docSnap) => {

            paymentRequests.push({

                id: docSnap.id,

                ...docSnap.data()

            });

        });


        // ==================================================
        // SORT
        // Pending first
        // Then newest request
        // ==================================================

        paymentRequests.sort((a, b) => {

            const statusA =
                a.status || "Pending";

            const statusB =
                b.status || "Pending";


            if (
                statusA === "Pending" &&
                statusB !== "Pending"
            ) {
                return -1;
            }


            if (
                statusA !== "Pending" &&
                statusB === "Pending"
            ) {
                return 1;
            }


            return getTime(
                b.submittedAt ||
                b.createdAt ||
                b.createdAtISO
            )
            -
            getTime(
                a.submittedAt ||
                a.createdAt ||
                a.createdAtISO
            );

        });


        loadingBox.style.display = "none";


        updateStats();

        renderPayments();


    } catch (error) {

        console.error(
            "Payment loading error:",
            error
        );


        loadingBox.style.display = "none";


        paymentList.innerHTML = "";


        emptyBox.style.display = "block";


        showToast(
            "❌ Payment requests load नहीं हो सके."
        );

    }

}


// ==========================================================
// UPDATE STATS
// ==========================================================

function updateStats() {

    const pending =
        paymentRequests.filter(
            item =>
                (item.status || "Pending")
                === "Pending"
        ).length;


    const approved =
        paymentRequests.filter(
            item =>
                item.status === "Approved"
        ).length;


    const rejected =
        paymentRequests.filter(
            item =>
                item.status === "Rejected"
        ).length;


    if (pendingCount) {

        pendingCount.textContent =
            pending;

    }


    if (approvedCount) {

        approvedCount.textContent =
            approved;

    }


    if (rejectedCount) {

        rejectedCount.textContent =
            rejected;

    }

}


// ==========================================================
// FILTER
// ==========================================================

function getFilteredPayments() {

    const selectedStatus =
        statusFilter
            ? statusFilter.value
            : "All";


    const search =
        searchInput
            ? searchInput.value
                .trim()
                .toLowerCase()
            : "";


    return paymentRequests.filter(
        payment => {


            const status =
                payment.status ||
                "Pending";


            const statusMatch =
                selectedStatus === "All" ||
                status === selectedStatus;


            const transactionId =
                payment.transactionId ||
                payment.txnId ||
                "";


            const searchText = [

                payment.studentName,

                payment.mobile,

                transactionId,

                payment.plan

            ]
                .filter(Boolean)
                .join(" ")
                .toLowerCase();


            const searchMatch =
                !search ||
                searchText.includes(search);


            return (
                statusMatch &&
                searchMatch
            );

        }
    );

}


// ==========================================================
// RENDER
// ==========================================================

function renderPayments() {

    paymentList.innerHTML = "";


    const filtered =
        getFilteredPayments();


    if (!filtered.length) {

        emptyBox.style.display =
            "block";

        return;

    }


    emptyBox.style.display =
        "none";


    filtered.forEach(payment => {

        paymentList.appendChild(
            createPaymentCard(payment)
        );

    });

}


// ==========================================================
// CREATE PAYMENT CARD
// ==========================================================

function createPaymentCard(payment) {

    const card =
        document.createElement("div");


    card.className =
        "payment-card";


    const name =
        payment.studentName ||
        "Unknown Student";


    const initial =
        name
            .charAt(0)
            .toUpperCase();


    const status =
        payment.status ||
        "Pending";


    const statusClass =
        status.toLowerCase();


    const transactionId =
        payment.transactionId ||
        payment.txnId ||
        "-";


    const submitted =
        formatDate(
            payment.submittedAt ||
            payment.createdAt ||
            payment.createdAtISO
        );


    card.innerHTML = `

        <div class="payment-top">

            <div class="student-info">

                <div class="student-avatar">
                    ${escapeHtml(initial)}
                </div>

                <div>

                    <h3>
                        ${escapeHtml(name)}
                    </h3>

                    <p>
                        📱 ${escapeHtml(
                            payment.mobile || "-"
                        )}
                    </p>

                </div>

            </div>


            <span class="
                status-badge
                status-${statusClass}
            ">

                ${getStatusIcon(status)}

                ${escapeHtml(status)}

            </span>

        </div>


        <div class="payment-details">

            <div class="detail-item">

                <span>
                    Plan
                </span>

                <strong>
                    💎 ${escapeHtml(
                        payment.plan ||
                        "Premium"
                    )}
                </strong>

            </div>


            <div class="detail-item">

                <span>
                    Amount
                </span>

                <strong>
                    ₹${escapeHtml(
                        String(
                            payment.amount ||
                            199
                        )
                    )}
                </strong>

            </div>


            <div class="detail-item">

                <span>
                    Transaction ID
                </span>

                <strong class="transaction-id">

                    ${escapeHtml(
                        transactionId
                    )}

                </strong>

            </div>


            <div class="detail-item">

                <span>
                    Payment Date
                </span>

                <strong>
                    ${escapeHtml(
                        submitted
                    )}
                </strong>

            </div>

        </div>


        <div class="payment-bottom">

            <div class="submitted-time">

                Request ID:
                ${escapeHtml(payment.id)}

            </div>


            ${
                status === "Pending"

                ?

                `

                <div class="action-buttons">

                    <button
                        class="action-btn approve-btn"
                        data-action="approve"
                        data-id="${escapeHtml(
                            payment.id
                        )}">

                        ✅ Approve

                    </button>


                    <button
                        class="action-btn reject-btn"
                        data-action="reject"
                        data-id="${escapeHtml(
                            payment.id
                        )}">

                        ❌ Reject

                    </button>

                </div>

                `

                :

                `

                <div class="submitted-time">

                    ${
                        status === "Approved"

                        ?

                        "✅ Premium Activated"

                        :

                        "❌ " +
                        escapeHtml(
                            payment.rejectionReason ||
                            "Payment rejected"
                        )
                    }

                </div>

                `
            }

        </div>

    `;


    return card;

}


// ==========================================================
// OPEN APPROVAL MODAL
// ==========================================================

function openApprovalModal(payment) {

    selectedPayment =
        payment;


    approvalDetails.innerHTML = `

        <div>
            <strong>Student:</strong>
            ${escapeHtml(
                payment.studentName ||
                "-"
            )}
        </div>


        <div>
            <strong>Mobile:</strong>
            ${escapeHtml(
                payment.mobile ||
                "-"
            )}
        </div>


        <div>
            <strong>Plan:</strong>
            ${escapeHtml(
                payment.plan ||
                "Premium"
            )}
        </div>


        <div>
            <strong>Amount:</strong>
            ₹${escapeHtml(
                String(
                    payment.amount ||
                    199
                )
            )}
        </div>


        <div>
            <strong>Transaction ID:</strong>
            ${escapeHtml(
                payment.transactionId ||
                payment.txnId ||
                "-"
            )}
        </div>

    `;


    approvalModal.classList.add(
        "show"
    );

}


// ==========================================================
// OPEN REJECT MODAL
// ==========================================================

function openRejectModal(payment) {

    selectedPayment =
        payment;


    rejectReason.value = "";


    rejectModal.classList.add(
        "show"
    );

}


// ==========================================================
// APPROVE PAYMENT
// ==========================================================

async function approvePayment() {

    if (!selectedPayment) {
        return;
    }


    const payment =
        selectedPayment;


    const confirmBtn =
        document.getElementById(
            "confirmApproval"
        );


    try {

        if (confirmBtn) {

            confirmBtn.disabled =
                true;

            confirmBtn.textContent =
                "Approving...";

        }


        // ==================================================
        // CHECK PAYMENT AGAIN
        // ==================================================

        const paymentDoc =
            doc(
                db,
                PAYMENT_COLLECTION,
                payment.id
            );


        const paymentSnap =
            await getDoc(
                paymentDoc
            );


        if (!paymentSnap.exists()) {

            throw new Error(
                "Payment request not found."
            );

        }


        const latestPayment =
            paymentSnap.data();


        // ==================================================
        // PREVENT DOUBLE APPROVAL
        // ==================================================

        if (
            latestPayment.status ===
            "Approved"
        ) {

            throw new Error(
                "This payment is already approved."
            );

        }


        // ==================================================
        // MOBILE
        // ==================================================

        const mobile =
            String(
                latestPayment.mobile ||
                payment.mobile ||
                ""
            ).trim();


        if (!mobile) {

            throw new Error(
                "Student mobile number missing."
            );

        }


        // ==================================================
        // EXPIRY = 30 DAYS
        // ==================================================

        const now =
            new Date();


        const expiry =
            new Date(now);


        expiry.setDate(
            expiry.getDate() + 30
        );


        const expiryISO =
            expiry.toISOString();


        const expiryDate =
            expiryISO.split("T")[0];


        // ==================================================
        // TRANSACTION ID
        // ==================================================

        const transactionId =
            latestPayment.transactionId ||
            latestPayment.txnId ||
            payment.transactionId ||
            payment.txnId ||
            "";


        // ==================================================
        // SUBSCRIPTION DATA
        // IMPORTANT:
        // Supports OLD + V2 student system
        // ==================================================

        const subscriptionData = {

            // Old system fields

            studentName:
                latestPayment.studentName ||
                payment.studentName ||
                "Student",

            mobile:
                mobile,

            plan:
                "Premium",

            status:
                "Active",

            expiryDate:
                expiryDate,


            // V2 system fields

            currentPlan:
                "Premium",

            subscriptionStatus:
                "Active",

            expiry:
                expiryISO,


            // Payment details

            amount:
                latestPayment.amount ||
                payment.amount ||
                199,

            transactionId:
                transactionId,

            activatedAt:
                serverTimestamp(),

            updatedAt:
                serverTimestamp()

        };


        // ==================================================
        // SAVE SUBSCRIPTION
        // ==================================================

        await setDoc(
            doc(
                db,
                SUBSCRIPTION_COLLECTION,
                mobile
            ),
            subscriptionData,
            {
                merge: true
            }
        );


        // ==================================================
        // UPDATE PAYMENT REQUEST
        // ==================================================

        await updateDoc(
            paymentDoc,
            {

                status:
                    "Approved",

                approvedAt:
                    serverTimestamp(),

                expiryDate:
                    expiryDate,

                expiry:
                    expiryISO

            }
        );


        // ==================================================
        // CLOSE MODAL
        // ==================================================

        approvalModal.classList.remove(
            "show"
        );


        selectedPayment =
            null;


        showToast(
            "✅ Payment Approved. Premium activated for 30 days."
        );


        await loadPayments();


    } catch (error) {

        console.error(
            "Approval error:",
            error
        );


        showToast(
            "❌ Payment approve नहीं हो पाया: " +
            error.message
        );


    } finally {

        if (confirmBtn) {

            confirmBtn.disabled =
                false;

            confirmBtn.textContent =
                "✅ Approve Payment";

        }

    }

}


// ==========================================================
// REJECT PAYMENT
// ==========================================================

async function rejectPayment() {

    if (!selectedPayment) {
        return;
    }


    const reason =
        rejectReason.value.trim();


    if (!reason) {

        showToast(
            "⚠️ Rejection reason डालें."
        );


        rejectReason.focus();

        return;

    }


    const confirmBtn =
        document.getElementById(
            "confirmReject"
        );


    try {

        if (confirmBtn) {

            confirmBtn.disabled =
                true;

            confirmBtn.textContent =
                "Rejecting...";

        }


        const paymentDoc =
            doc(
                db,
                PAYMENT_COLLECTION,
                selectedPayment.id
            );


        const paymentSnap =
            await getDoc(
                paymentDoc
            );


        if (!paymentSnap.exists()) {

            throw new Error(
                "Payment request not found."
            );

        }


        const latestPayment =
            paymentSnap.data();


        if (
            latestPayment.status ===
            "Approved"
        ) {

            throw new Error(
                "Approved payment cannot be rejected."
            );

        }


        await updateDoc(
            paymentDoc,
            {

                status:
                    "Rejected",

                rejectionReason:
                    reason,

                rejectedAt:
                    serverTimestamp()

            }
        );


        rejectModal.classList.remove(
            "show"
        );


        selectedPayment =
            null;


        showToast(
            "❌ Payment request rejected."
        );


        await loadPayments();


    } catch (error) {

        console.error(
            "Reject error:",
            error
        );


        showToast(
            "❌ Payment reject नहीं हो पाया: " +
            error.message
        );


    } finally {

        if (confirmBtn) {

            confirmBtn.disabled =
                false;

            confirmBtn.textContent =
                "❌ Reject Payment";

        }

    }

}


// ==========================================================
// EVENT DELEGATION
// ==========================================================

paymentList.addEventListener(
    "click",
    (event) => {

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


        const payment =
            paymentRequests.find(
                item =>
                    item.id === id
            );


        if (!payment) {
            return;
        }


        if (
            action === "approve"
        ) {

            openApprovalModal(
                payment
            );

        }


        if (
            action === "reject"
        ) {

            openRejectModal(
                payment
            );

        }

    }
);


// ==========================================================
// FILTER EVENTS
// ==========================================================

if (statusFilter) {

    statusFilter.addEventListener(
        "change",
        renderPayments
    );

}


if (searchInput) {

    searchInput.addEventListener(
        "input",
        renderPayments
    );

}


if (refreshBtn) {

    refreshBtn.addEventListener(
        "click",
        loadPayments
    );

}


// ==========================================================
// MODAL EVENTS
// ==========================================================

const modalClose =
    document.getElementById(
        "modalClose"
    );


if (modalClose) {

    modalClose.addEventListener(
        "click",
        closeApprovalModal
    );

}


const cancelApproval =
    document.getElementById(
        "cancelApproval"
    );


if (cancelApproval) {

    cancelApproval.addEventListener(
        "click",
        closeApprovalModal
    );

}


const confirmApproval =
    document.getElementById(
        "confirmApproval"
    );


if (confirmApproval) {

    confirmApproval.addEventListener(
        "click",
        approvePayment
    );

}


const rejectModalClose =
    document.getElementById(
        "rejectModalClose"
    );


if (rejectModalClose) {

    rejectModalClose.addEventListener(
        "click",
        closeRejectModal
    );

}


const cancelReject =
    document.getElementById(
        "cancelReject"
    );


if (cancelReject) {

    cancelReject.addEventListener(
        "click",
        closeRejectModal
    );

}


const confirmReject =
    document.getElementById(
        "confirmReject"
    );


if (confirmReject) {

    confirmReject.addEventListener(
        "click",
        rejectPayment
    );

}


// ==========================================================
// CLOSE APPROVAL MODAL
// ==========================================================

function closeApprovalModal() {

    approvalModal.classList.remove(
        "show"
    );

    selectedPayment =
        null;

}


// ==========================================================
// CLOSE REJECT MODAL
// ==========================================================

function closeRejectModal() {

    rejectModal.classList.remove(
        "show"
    );

    selectedPayment =
        null;

}


// ==========================================================
// CLOSE MODAL OUTSIDE
// ==========================================================

if (approvalModal) {

    approvalModal.addEventListener(
        "click",
        (event) => {

            if (
                event.target ===
                approvalModal
            ) {

                closeApprovalModal();

            }

        }
    );

}


if (rejectModal) {

    rejectModal.addEventListener(
        "click",
        (event) => {

            if (
                event.target ===
                rejectModal
            ) {

                closeRejectModal();

            }

        }
    );

}


// ==========================================================
// TOAST
// ==========================================================

let toastTimer = null;


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

        alert(message);

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
// DATE FORMAT
// Supports:
// submittedAt
// createdAt
// createdAtISO
// ==========================================================

function formatDate(timestamp) {

    if (!timestamp) {

        return "-";

    }


    try {

        let date;


        if (
            timestamp &&
            typeof timestamp.toDate ===
            "function"
        ) {

            date =
                timestamp.toDate();

        } else {

            date =
                new Date(timestamp);

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

    } catch {

        return "-";

    }

}


// ==========================================================
// GET TIME
// Used for client-side sorting
// ==========================================================

function getTime(timestamp) {

    if (!timestamp) {
        return 0;
    }


    try {

        if (
            timestamp &&
            typeof timestamp.toDate ===
            "function"
        ) {

            return timestamp
                .toDate()
                .getTime();

        }


        const time =
            new Date(
                timestamp
            ).getTime();


        return Number.isNaN(time)
            ? 0
            : time;

    } catch {

        return 0;

    }

}


// ==========================================================
// STATUS ICON
// ==========================================================

function getStatusIcon(status) {

    if (
        status === "Approved"
    ) {

        return "✅";

    }


    if (
        status === "Rejected"
    ) {

        return "❌";

    }


    return "⏳";

}


// ==========================================================
// HTML ESCAPE
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
// INITIAL LOAD
// ==========================================================

loadPayments();


// ==========================================================
// AUTO REFRESH
// ==========================================================

setInterval(
    loadPayments,
    30000
);


// ==========================================================
// CONSOLE
// ==========================================================

console.log(
    "🚀 Raj Mock Test V2.0 - Admin Payment Approval Started"
);

console.log(
    "🔥 Firestore Collection:",
    PAYMENT_COLLECTION
);