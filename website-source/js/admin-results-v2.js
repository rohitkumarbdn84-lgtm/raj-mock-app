// ==========================================================
// RAJ MOCK TEST V2.0
// ADMIN RESULTS
// FIRESTORE
// VIEW + DELETE RESULTS
// ==========================================================

import { db } from "./firebase.js";

import {
    collection,
    getDocs,
    deleteDoc,
    doc
} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";


// ==========================================================
// ELEMENTS
// ==========================================================

const resultsTableBody =
    document.getElementById("resultsTableBody");

const searchInput =
    document.getElementById("searchInput");

const resultCount =
    document.getElementById("resultCount");

const totalResults =
    document.getElementById("totalResults");

const totalStudents =
    document.getElementById("totalStudents");

const bestScore =
    document.getElementById("bestScore");

const averageScore =
    document.getElementById("averageScore");

const loadingMessage =
    document.getElementById("loadingMessage");

const emptyMessage =
    document.getElementById("emptyMessage");

const refreshBtn =
    document.getElementById("refreshBtn");

const backDashboardBtn =
    document.getElementById("backDashboardBtn");

const logoutBtn =
    document.getElementById("logoutBtn");


// ==========================================================
// MODAL ELEMENTS
// ==========================================================

const viewModal =
    document.getElementById("viewModal");

const closeModalBtn =
    document.getElementById("closeModalBtn");

const modalCloseBtn =
    document.getElementById("modalCloseBtn");

const modalDeleteBtn =
    document.getElementById("modalDeleteBtn");

const deleteModal =
    document.getElementById("deleteModal");

const cancelDeleteBtn =
    document.getElementById("cancelDeleteBtn");

const confirmDeleteBtn =
    document.getElementById("confirmDeleteBtn");


// ==========================================================
// DATA
// ==========================================================

let allResults = [];

let filteredResults = [];

let selectedResult = null;

let deleting = false;


// ==========================================================
// SAFE TEXT
// ==========================================================

function safe(value, fallback = "-") {

    if (
        value === undefined ||
        value === null ||
        String(value).trim() === ""
    ) {

        return fallback;

    }

    return String(value);

}


// ==========================================================
// GET DATE
// ==========================================================

function getResultDate(result) {

    try {

        if (result.submittedAtISO) {

            const date =
                new Date(result.submittedAtISO);

            if (!Number.isNaN(date.getTime())) {

                return date;

            }

        }


        if (
            result.submittedAt &&
            typeof result.submittedAt.toDate === "function"
        ) {

            return result.submittedAt.toDate();

        }


        if (
            result.createdAt &&
            typeof result.createdAt.toDate === "function"
        ) {

            return result.createdAt.toDate();

        }


        if (
            result.submittedAt &&
            result.submittedAt.seconds
        ) {

            return new Date(
                Number(result.submittedAt.seconds) * 1000
            );

        }


        if (
            result.createdAt &&
            result.createdAt.seconds
        ) {

            return new Date(
                Number(result.createdAt.seconds) * 1000
            );

        }

    }
    catch (error) {

        console.warn(
            "Date conversion error:",
            error
        );

    }

    return null;

}


// ==========================================================
// FORMAT DATE
// ==========================================================

function formatDate(result) {

    const date =
        getResultDate(result);


    if (!date) {

        return "-";

    }


    return date.toLocaleString(
        "en-IN",
        {
            day: "2-digit",
            month: "short",
            year: "numeric",
            hour: "2-digit",
            minute: "2-digit"
        }
    );

}


// ==========================================================
// FORMAT TIME
// ==========================================================

function formatTime(seconds) {

    seconds =
        Math.max(
            0,
            Number(seconds) || 0
        );


    const minutes =
        Math.floor(
            seconds / 60
        );


    const remainingSeconds =
        seconds % 60;


    return (
        String(minutes).padStart(2, "0")
        +
        ":"
        +
        String(remainingSeconds).padStart(2, "0")
    );

}


// ==========================================================
// GET PERCENTAGE
// ==========================================================

function getPercentage(result) {

    if (
        result.percentage !== undefined &&
        result.percentage !== null
    ) {

        return Number(
            result.percentage
        ) || 0;

    }


    const total =
        Number(result.total) || 0;

    const correct =
        Number(result.correct) || 0;


    if (!total) {

        return 0;

    }


    return (
        correct / total
    ) * 100;

}


// ==========================================================
// LOAD RESULTS
// ==========================================================

async function loadResults() {

    try {

        showLoading(true);

        console.log(
            "📊 Loading admin results..."
        );


        const snapshot =
            await getDocs(
                collection(
                    db,
                    "results"
                )
            );


        allResults = [];


        snapshot.forEach(
            docSnap => {

                allResults.push({

                    id:
                        docSnap.id,

                    ...docSnap.data()

                });

            }
        );


        // ==================================================
        // SORT NEWEST FIRST
        // ==================================================

        allResults.sort(
            function (a, b) {

                const dateA =
                    getResultDate(a);

                const dateB =
                    getResultDate(b);


                const timeA =
                    dateA
                    ? dateA.getTime()
                    : 0;


                const timeB =
                    dateB
                    ? dateB.getTime()
                    : 0;


                return timeB - timeA;

            }
        );


        updateStatistics();


        applySearch();


        showLoading(false);


        console.log(
            "✅ Results loaded:",
            allResults.length
        );

    }
    catch (error) {

        console.error(
            "❌ RESULT LOAD ERROR:",
            error
        );


        showLoading(false);


        if (resultsTableBody) {

            resultsTableBody.innerHTML = `

                <tr>

                    <td
                        colspan="10"
                        class="error-cell"
                    >

                        ❌ Unable to load results.

                        <br>

                        <small>
                            ${safe(error.message)}
                        </small>

                    </td>

                </tr>

            `;

        }

    }

}


// ==========================================================
// UPDATE STATISTICS
// ==========================================================

function updateStatistics() {

    const results =
        allResults;


    if (totalResults) {

        totalResults.textContent =
            results.length;

    }


    const uniqueStudents =
        new Set();


    results.forEach(
        result => {

            const studentId =
                result.studentId ||
                result.studentMobile ||
                result.mobile ||
                result.studentName ||
                "unknown";


            uniqueStudents.add(
                String(studentId)
            );

        }
    );


    if (totalStudents) {

        totalStudents.textContent =
            uniqueStudents.size;

    }


    if (!results.length) {

        if (bestScore) {

            bestScore.textContent =
                "0%";

        }


        if (averageScore) {

            averageScore.textContent =
                "0%";

        }

        return;

    }


    const percentages =
        results.map(
            result =>
                getPercentage(result)
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
        )
        /
        percentages.length;


    if (bestScore) {

        bestScore.textContent =
            `${best.toFixed(0)}%`;

    }


    if (averageScore) {

        averageScore.textContent =
            `${average.toFixed(0)}%`;

    }

}


// ==========================================================
// SEARCH
// ==========================================================

function applySearch() {

    const keyword =
        String(
            searchInput?.value || ""
        )
        .trim()
        .toLowerCase();


    if (!keyword) {

        filteredResults =
            [...allResults];

    }
    else {

        filteredResults =
            allResults.filter(
                result => {

                    const studentName =
                        safe(
                            result.studentName,
                            ""
                        )
                        .toLowerCase();


                    const mobile =
                        safe(
                            result.studentMobile ||
                            result.mobile,
                            ""
                        )
                        .toLowerCase();


                    const testName =
                        safe(
                            result.testName,
                            ""
                        )
                        .toLowerCase();


                    const category =
                        safe(
                            result.categoryName,
                            ""
                        )
                        .toLowerCase();


                    return (
                        studentName.includes(keyword)
                        ||
                        mobile.includes(keyword)
                        ||
                        testName.includes(keyword)
                        ||
                        category.includes(keyword)
                    );

                }
            );

    }


    renderResults();

}


// ==========================================================
// RENDER RESULTS
// ==========================================================

function renderResults() {

    if (!resultsTableBody) {

        return;

    }


    resultsTableBody.innerHTML = "";


    if (resultCount) {

        resultCount.textContent =
            filteredResults.length;

    }


    if (!filteredResults.length) {

        if (emptyMessage) {

            emptyMessage.style.display =
                "block";

        }

        return;

    }


    if (emptyMessage) {

        emptyMessage.style.display =
            "none";

    }


    filteredResults.forEach(
        function (result, index) {

            const row =
                document.createElement("tr");


            const total =
                Number(
                    result.total || 0
                );


            const correct =
                Number(
                    result.correct || 0
                );


            const wrong =
                Number(
                    result.wrong || 0
                );


            const unattempted =
                Number(
                    result.unattempted ||
                    result.notAttempted ||
                    0
                );


            const percentage =
                getPercentage(result);


            const studentName =
                safe(
                    result.studentName,
                    "Student"
                );


            const mobile =
                safe(
                    result.studentMobile ||
                    result.mobile,
                    "-"
                );


            const testName =
                safe(
                    result.testName,
                    "Mock Test"
                );


            // ==================================================
            // SCORE CLASS
            // ==================================================

            let scoreClass =
                "score-average";


            if (percentage >= 80) {

                scoreClass =
                    "score-excellent";

            }
            else if (percentage < 40) {

                scoreClass =
                    "score-low";

            }


            row.innerHTML = `

                <td>
                    ${index + 1}
                </td>


                <td>

                    <div class="student-cell">

                        <div class="table-avatar">
                            ${escapeHTML(
                                studentName
                                    .charAt(0)
                                    .toUpperCase()
                            )}
                        </div>

                        <div>

                            <strong>
                                ${escapeHTML(
                                    studentName
                                )}
                            </strong>

                            <span>
                                ${escapeHTML(
                                    mobile
                                )}
                            </span>

                        </div>

                    </div>

                </td>


                <td>

                    <div class="test-cell">

                        <strong>
                            ${escapeHTML(
                                testName
                            )}
                        </strong>

                        <span>
                            ${escapeHTML(
                                safe(
                                    result.categoryName,
                                    ""
                                )
                            )}
                        </span>

                    </div>

                </td>


                <td>

                    <strong class="score-text">

                        ${correct}/${total}

                    </strong>

                </td>


                <td>

                    <span class="correct-pill">
                        ${correct}
                    </span>

                </td>


                <td>

                    <span class="wrong-pill">
                        ${wrong}
                    </span>

                </td>


                <td>

                    <span class="unattempted-pill">
                        ${unattempted}
                    </span>

                </td>


                <td>

                    <strong
                        class="${scoreClass}"
                    >

                        ${percentage.toFixed(0)}%

                    </strong>

                </td>


                <td>

                    <span class="date-text">

                        ${escapeHTML(
                            formatDate(result)
                        )}

                    </span>

                </td>


                <td>

                    <div class="action-buttons">

                        <button
                            type="button"
                            class="view-btn"
                            data-id="${escapeHTML(
                                result.id
                            )}"
                        >
                            👁️ View
                        </button>

                        <button
                            type="button"
                            class="delete-btn"
                            data-id="${escapeHTML(
                                result.id
                            )}"
                        >
                            🗑️ Delete
                        </button>

                    </div>

                </td>

            `;


            resultsTableBody.appendChild(
                row
            );

        }
    );


    // ======================================================
    // VIEW BUTTONS
    // ======================================================

    document
        .querySelectorAll(".view-btn")
        .forEach(
            button => {

                button.addEventListener(
                    "click",
                    function () {

                        const id =
                            this.dataset.id;


                        const result =
                            allResults.find(
                                item =>
                                    item.id === id
                            );


                        if (result) {

                            openViewModal(
                                result
                            );

                        }

                    }
                );

            }
        );


    // ======================================================
    // DELETE BUTTONS
    // ======================================================

    document
        .querySelectorAll(".delete-btn")
        .forEach(
            button => {

                button.addEventListener(
                    "click",
                    function () {

                        const id =
                            this.dataset.id;


                        const result =
                            allResults.find(
                                item =>
                                    item.id === id
                            );


                        if (result) {

                            openDeleteModal(
                                result
                            );

                        }

                    }
                );

            }
        );

}


// ==========================================================
// ESCAPE HTML
// ==========================================================

function escapeHTML(value) {

    return String(value ?? "")
        .replace(
            /&/g,
            "&amp;"
        )
        .replace(
            /</g,
            "&lt;"
        )
        .replace(
            />/g,
            "&gt;"
        )
        .replace(
            /"/g,
            "&quot;"
        )
        .replace(
            /'/g,
            "&#039;"
        );

}


// ==========================================================
// VIEW MODAL
// ==========================================================

function openViewModal(result) {

    selectedResult =
        result;


    const studentName =
        safe(
            result.studentName,
            "Student"
        );


    document.getElementById(
        "modalTestName"
    ).textContent =
        safe(
            result.testName,
            "Mock Test"
        );


    document.getElementById(
        "modalStudentName"
    ).textContent =
        studentName;


    document.getElementById(
        "modalStudentMobile"
    ).textContent =
        safe(
            result.studentMobile ||
            result.mobile,
            "-"
        );


    document.getElementById(
        "modalAvatar"
    ).textContent =
        studentName
            .charAt(0)
            .toUpperCase();


    document.getElementById(
        "modalPercentage"
    ).textContent =
        `${getPercentage(result).toFixed(0)}%`;


    document.getElementById(
        "modalCorrect"
    ).textContent =
        Number(
            result.correct || 0
        );


    document.getElementById(
        "modalWrong"
    ).textContent =
        Number(
            result.wrong || 0
        );


    document.getElementById(
        "modalUnattempted"
    ).textContent =
        Number(
            result.unattempted ||
            result.notAttempted ||
            0
        );


    document.getElementById(
        "modalTotal"
    ).textContent =
        Number(
            result.total || 0
        );


    document.getElementById(
        "modalTime"
    ).textContent =
        formatTime(
            result.timeTaken || 0
        );


    document.getElementById(
        "modalDuration"
    ).textContent =
        `${Number(
            result.duration || 0
        )} Min`;


    document.getElementById(
        "modalCategory"
    ).textContent =
        safe(
            result.categoryName,
            "-"
        );


    document.getElementById(
        "modalDate"
    ).textContent =
        formatDate(result);


    if (viewModal) {

        viewModal.style.display =
            "flex";

    }

}


// ==========================================================
// CLOSE VIEW MODAL
// ==========================================================

function closeViewModal() {

    selectedResult =
        null;


    if (viewModal) {

        viewModal.style.display =
            "none";

    }

}


// ==========================================================
// DELETE MODAL
// ==========================================================

function openDeleteModal(result) {

    selectedResult =
        result;


    document.getElementById(
        "deleteStudentName"
    ).textContent =
        safe(
            result.studentName,
            "Student"
        );


    document.getElementById(
        "deleteTestName"
    ).textContent =
        safe(
            result.testName,
            "Mock Test"
        );


    document.getElementById(
        "deleteScore"
    ).textContent =
        `Score: ${
            Number(result.correct || 0)
        }/${
            Number(result.total || 0)
        } • ${
            getPercentage(result).toFixed(0)
        }%`;


    if (deleteModal) {

        deleteModal.style.display =
            "flex";

    }

}


// ==========================================================
// CLOSE DELETE MODAL
// ==========================================================

function closeDeleteModal() {

    if (deleteModal) {

        deleteModal.style.display =
            "none";

    }

}


// ==========================================================
// DELETE RESULT
// ==========================================================

async function deleteResult() {

    if (!selectedResult) {

        return;

    }


    if (deleting) {

        return;

    }


    deleting = true;


    if (confirmDeleteBtn) {

        confirmDeleteBtn.disabled =
            true;

        confirmDeleteBtn.textContent =
            "⏳ Deleting...";

    }


    try {

        console.log(
            "🗑️ Deleting result:",
            selectedResult.id
        );


        // ==================================================
        // FIRESTORE DELETE
        // ==================================================

        await deleteDoc(
            doc(
                db,
                "results",
                selectedResult.id
            )
        );


        console.log(
            "✅ Result deleted:",
            selectedResult.id
        );


        // ==================================================
        // REMOVE FROM LOCAL ARRAY
        // ==================================================

        allResults =
            allResults.filter(
                result =>
                    result.id !==
                    selectedResult.id
            );


        updateStatistics();

        closeDeleteModal();

        closeViewModal();

        applySearch();


        alert(
            "✅ Result deleted successfully."
        );

    }
    catch (error) {

        console.error(
            "❌ DELETE RESULT ERROR:",
            error
        );


        if (
            error.code ===
            "permission-denied"
        ) {

            alert(
                "❌ Permission denied. Firestore rules are not allowing result deletion."
            );

        }
        else {

            alert(
                "❌ Unable to delete result.\n\n"
                +
                error.message
            );

        }

    }
    finally {

        deleting = false;


        if (confirmDeleteBtn) {

            confirmDeleteBtn.disabled =
                false;

            confirmDeleteBtn.textContent =
                "Yes, Delete";

        }

    }

}


// ==========================================================
// EVENT LISTENERS
// ==========================================================

if (searchInput) {

    searchInput.addEventListener(
        "input",
        applySearch
    );

}


if (refreshBtn) {

    refreshBtn.addEventListener(
        "click",
        loadResults
    );

}


if (backDashboardBtn) {

    backDashboardBtn.addEventListener(
        "click",
        function () {

            window.location.href =
                "admin-dashboard-v2.html";

        }
    );

}


if (closeModalBtn) {

    closeModalBtn.addEventListener(
        "click",
        closeViewModal
    );

}


if (modalCloseBtn) {

    modalCloseBtn.addEventListener(
        "click",
        closeViewModal
    );

}


if (modalDeleteBtn) {

    modalDeleteBtn.addEventListener(
        "click",
        function () {

            if (selectedResult) {

                closeViewModal();

                openDeleteModal(
                    selectedResult
                );

            }

        }
    );

}


if (cancelDeleteBtn) {

    cancelDeleteBtn.addEventListener(
        "click",
        closeDeleteModal
    );

}


if (confirmDeleteBtn) {

    confirmDeleteBtn.addEventListener(
        "click",
        deleteResult
    );

}


// ==========================================================
// CLICK OUTSIDE MODALS
// ==========================================================

if (viewModal) {

    viewModal.addEventListener(
        "click",
        function (event) {

            if (
                event.target ===
                viewModal
            ) {

                closeViewModal();

            }

        }
    );

}


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
// LOGOUT
// ==========================================================

if (logoutBtn) {

    logoutBtn.addEventListener(
        "click",
        function () {

            const confirmLogout =
                confirm(
                    "Are you sure you want to logout?"
                );


            if (!confirmLogout) {

                return;

            }


            localStorage.removeItem(
                "admin"
            );

            localStorage.removeItem(
                "adminLoggedIn"
            );

            localStorage.removeItem(
                "adminName"
            );


            sessionStorage.removeItem(
                "admin"
            );

            sessionStorage.removeItem(
                "adminLoggedIn"
            );

            sessionStorage.removeItem(
                "adminName"
            );


            window.location.replace(
                "admin-login-v2.html"
            );

        }
    );

}


// ==========================================================
// LOADING
// ==========================================================

function showLoading(show) {

    if (!loadingMessage) {

        return;

    }


    loadingMessage.style.display =
        show
        ? "block"
        : "none";

}


// ==========================================================
// START
// ==========================================================

console.log(
    "🚀 ADMIN RESULTS V2 STARTED"
);

loadResults();