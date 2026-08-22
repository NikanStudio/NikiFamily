let topics = JSON.parse(
    localStorage.getItem("nikiFamilyTopics")
) || [];

let currentTopicId = null;


/* اگر سایت برای اولین بار باز شد */

if (topics.length === 0) {

    topics = [
        {
            id: Date.now(),
            title: "به نیکی فمیلی خوش اومدید 💜",
            text: "اینجا می‌تونیم با هم صحبت کنیم و تاپیک‌های مختلف بسازیم.",
            username: "مدیریت نیکی فمیلی",
            date: new Date().toLocaleDateString("fa-IR"),
            replies: []
        }
    ];

    saveTopics();
}


/* ذخیره */

function saveTopics() {

    localStorage.setItem(
        "nikiFamilyTopics",
        JSON.stringify(topics)
    );

}


/* نمایش تاپیک‌ها */

function displayTopics(list = topics) {

    const container = document.getElementById("topics");

    document.getElementById("topicCount").textContent =
        list.length + " تاپیک";


    if (list.length === 0) {

        container.innerHTML = `
            <div class="empty">
                تاپیکی پیدا نشد 😕
            </div>
        `;

        return;
    }


    container.innerHTML = "";


    [...list].reverse().forEach(topic => {

        const div = document.createElement("div");

        div.className = "topic";

        div.onclick = () => openTopic(topic.id);


        div.innerHTML = `

            <h3>${escapeHTML(topic.title)}</h3>

            <div class="topic-info">
                توسط ${escapeHTML(topic.username)}
                • ${topic.date}
                • ${topic.replies.length} پاسخ
            </div>

            <div class="topic-preview">
                ${escapeHTML(topic.text.substring(0, 120))}
                ${topic.text.length > 120 ? "..." : ""}
            </div>

        `;

        container.appendChild(div);

    });

}


/* باز کردن فرم */

function openTopicForm() {

    document.getElementById("topicModal").style.display = "block";

}


/* بستن فرم */

function closeTopicForm() {

    document.getElementById("topicModal").style.display = "none";

}


/* ساخت تاپیک */

function createTopic() {

    const username =
        document.getElementById("username").value.trim();

    const title =
        document.getElementById("topicTitle").value.trim();

    const text =
        document.getElementById("topicText").value.trim();


    if (!username || !title || !text) {

        alert("لطفاً همه قسمت‌ها را پر کنید.");

        return;
    }


    const newTopic = {

        id: Date.now(),

        title: title,

        text: text,

        username: username,

        date: new Date().toLocaleDateString("fa-IR"),

        replies: []

    };


    topics.push(newTopic);

    saveTopics();

    displayTopics();


    document.getElementById("username").value = "";

    document.getElementById("topicTitle").value = "";

    document.getElementById("topicText").value = "";

    closeTopicForm();

}


/* باز کردن تاپیک */

function openTopic(id) {

    currentTopicId = id;

    const topic =
        topics.find(t => t.id === id);


    if (!topic) return;


    const content =
        document.getElementById("topicContent");


    let repliesHTML = "";


    if (topic.replies.length > 0) {

        repliesHTML = `
            <h3>پاسخ‌ها</h3>
        `;


        topic.replies.forEach(reply => {

            repliesHTML += `

                <div class="reply">

                    <strong>
                        ${escapeHTML(reply.username)}
                    </strong>

                    <small>
                        ${reply.date}
                    </small>

                    <div>
                        ${escapeHTML(reply.text)}
                    </div>

                </div>

            `;

        });

    } else {

        repliesHTML = `
            <p style="color:#777;margin:15px 0">
                هنوز کسی پاسخ نداده است.
            </p>
        `;

    }


    content.innerHTML = `

        <h2 class="topic-main-title">
            ${escapeHTML(topic.title)}
        </h2>

        <div class="topic-author">
            توسط ${escapeHTML(topic.username)}
            • ${topic.date}
        </div>

        <div class="topic-body">
            ${escapeHTML(topic.text)}
        </div>

        ${repliesHTML}

    `;


    document.getElementById("topicView").style.display = "block";

}


/* بستن تاپیک */

function closeTopic() {

    document.getElementById("topicView").style.display = "none";

}


/* پاسخ */

function addReply() {

    const name =
        document.getElementById("replyName").value.trim();

    const text =
        document.getElementById("replyText").value.trim();


    if (!name || !text) {

        alert("لطفاً نام و پاسخ را وارد کنید.");

        return;
    }


    const topic =
        topics.find(t => t.id === currentTopicId);


    if (!topic) return;


    topic.replies.push({

        username: name,

        text: text,

        date: new Date().toLocaleDateString("fa-IR")

    });


    saveTopics();

    openTopic(currentTopicId);

    displayTopics();


    document.getElementById("replyName").value = "";

    document.getElementById("replyText").value = "";

}


/* جستجو */

function searchTopics() {

    const query =
        document.getElementById("searchInput")
        .value
        .toLowerCase()
        .trim();


    const result = topics.filter(topic =>

        topic.title.toLowerCase().includes(query) ||

        topic.text.toLowerCase().includes(query)

    );


    displayTopics(result);

}


/* جلوگیری از HTML Injection */

function escapeHTML(text) {

    return String(text)
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#039;");

}


/* شروع */

displayTopics();
