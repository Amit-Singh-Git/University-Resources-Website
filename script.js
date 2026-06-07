// --- Database / Mock Data ---
// Structure: Category -> Course -> Subject -> Tab (Major/Minor/MDC/VAC) -> Array of PDFs
const database = {
    "B.A.": {
        "History": {
            "Major": [
                { id: 1, title: "Ancient Indian History Unit 1", file: "history_major_1.pdf" }
            ],
            "Minor": [
                { id: 2, title: "History Minor Syllabus Summary", file: "history_minor_1.pdf" }
            ],
            "MDC": [
                // Mock data specifically requested for testing
                { id: 3, title: "History MDC - Testing Sample PDF", file: "sample_history_mdc.pdf" },
                { id: 4, title: "MDC Notes Part 2", file: "sample_history_mdc_2.pdf" }
            ],
            "VAC": []
        },
        "Political Science": { Major: [], Minor: [], MDC: [], VAC: [] },
        "Hindi": { Major: [], Minor: [], MDC: [], VAC: [] },
        "English": { Major: [], Minor: [], MDC: [], VAC: [] }
    },
    "B.Sc.": {
        "Physics": { Major: [], Minor: [], MDC: [], VAC: [] },
        "Chemistry": { Major: [], Minor: [], MDC: [], VAC: [] },
        "Mathematics": { Major: [], Minor: [], MDC: [], VAC: [] }
    },
    "B.Com.": {
        "Accounts": { Major: [], Minor: [], MDC: [], VAC: [] },
        "Business Studies": { Major: [], Minor: [], MDC: [], VAC: [] }
    },
    "BCA": {
        "Computer Fundamentals": { Major: [], Minor: [], MDC: [], VAC: [] },
        "Programming in C": { Major: [], Minor: [], MDC: [], VAC: [] }
    }
};

// --- State Variables ---
let currentCategory = ""; // PYQ, Notes, Syllabus
let currentCourse = "";
let currentSubject = "";
let currentTab = "Major"; // Default tab
let pdfToView = null;

// --- Elements ---
const pageTitleEl = document.getElementById("current-page-title");
const dropdownMenu = document.getElementById("dropdown-menu");
const hamburgerBtn = document.getElementById("hamburger-btn");
const pages = document.querySelectorAll(".page-section");

// --- Menu Toggle ---
hamburgerBtn.addEventListener("click", () => {
    dropdownMenu.classList.toggle("hidden");
});

function closeMenu() {
    dropdownMenu.classList.add("hidden");
}

// --- Navigation Controller ---
function navigate(pageId, pageTitle, category = null) {
    closeMenu();
    
    // Set State
    if (category) currentCategory = category;
    pageTitleEl.innerText = pageTitle;

    // Hide all pages, show target
    pages.forEach(p => p.classList.add("hidden"));
    document.getElementById(`page-${pageId}`).classList.remove("hidden");

    // Page Specific Initialization
    if (pageId === "course-selection") {
        document.getElementById("course-search").value = "";
        renderCourses();
    }
}

// --- Render Functions ---

function renderCourses() {
    const listContainer = document.getElementById("course-list");
    listContainer.innerHTML = "";
    
    const courses = Object.keys(database);
    courses.forEach(course => {
        const btn = document.createElement("button");
        btn.className = "list-item";
        btn.innerText = course;
        btn.onclick = () => {
            currentCourse = course;
            navigate("subject-selection", `${currentCategory} > ${course}`);
            document.getElementById("subject-search").value = "";
            renderSubjects();
        };
        listContainer.appendChild(btn);
    });
}

function renderSubjects() {
    const listContainer = document.getElementById("subject-list");
    listContainer.innerHTML = "";
    
    const subjects = Object.keys(database[currentCourse]);
    subjects.forEach(subject => {
        const btn = document.createElement("button");
        btn.className = "list-item";
        btn.innerText = subject;
        btn.onclick = () => {
            currentSubject = subject;
            currentTab = "Major"; // reset tab
            navigate("content", `${courseShorthand()} > ${subject}`);
            document.getElementById("pdf-search").value = "";
            updateTabsUI();
            renderPDFs();
        };
        listContainer.appendChild(btn);
    });
}

function renderPDFs() {
    const listContainer = document.getElementById("pdf-list");
    listContainer.innerHTML = "";

    const pdfs = database[currentCourse][currentSubject][currentTab];

    if (!pdfs || pdfs.length === 0) {
        listContainer.innerHTML = `<p style="text-align:center; color:#64748b; margin-top: 20px;">No PDFs available for this section yet.</p>`;
        return;
    }

    pdfs.forEach(pdf => {
        const card = document.createElement("div");
        card.className = "pdf-card";
        
        card.innerHTML = `
            <div class="pdf-title">${pdf.title}</div>
            <div class="pdf-actions">
                <button class="primary-btn btn-small btn-outline" onclick="viewPDF('${pdf.title}', '${pdf.file}')">View PDF</button>
                <a href="${pdf.file}" download="${pdf.file}" class="primary-btn btn-small">Download</a>
            </div>
        `;
        listContainer.appendChild(card);
    });
}

// --- Tabs Functionality ---
function switchTab(tabName) {
    currentTab = tabName;
    updateTabsUI();
    document.getElementById("pdf-search").value = "";
    renderPDFs();
}

function updateTabsUI() {
    const tabs = document.querySelectorAll(".tab-btn");
    tabs.forEach(tab => {
        if (tab.innerText === currentTab) {
            tab.classList.add("active");
        } else {
            tab.classList.remove("active");
        }
    });
}

// --- PDF Viewer Functionality ---
function viewPDF(title, file) {
    pdfToView = { title, file };
    document.getElementById("viewer-title").innerText = title;
    
    // Update the download button in the viewer
    const dlBtn = document.getElementById("viewer-download-btn");
    dlBtn.href = file;
    dlBtn.setAttribute("download", file);

    // Navigate to viewer
    pages.forEach(p => p.classList.add("hidden"));
    document.getElementById("page-pdf-viewer").classList.remove("hidden");
    pageTitleEl.innerText = "Viewing Document";
}

function goBackToContent() {
    navigate("content", `${courseShorthand()} > ${currentSubject}`);
    updateTabsUI();
    renderPDFs();
}

// --- Utility Functions ---
function courseShorthand() {
    return currentCourse.length > 6 ? currentCourse.substring(0,6) + ".." : currentCourse;
}

// Universal Search Filter
function filterList(listId, searchId) {
    const input = document.getElementById(searchId).value.toUpperCase();
    const list = document.getElementById(listId);
    
    // Different logic depending on if filtering buttons (courses/subjects) or divs (PDF cards)
    const items = listId === "pdf-list" ? list.querySelectorAll('.pdf-card') : list.getElementsByTagName('button');

    for (let i = 0; i < items.length; i++) {
        const textValue = items[i].textContent || items[i].innerText;
        if (textValue.toUpperCase().indexOf(input) > -1) {
            items[i].style.display = "";
        } else {
            items[i].style.display = "none";
        }
    }
}