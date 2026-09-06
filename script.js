/* ==================================================
   NIKI FAMILY
   Supabase Cloud Database
   ================================================== */

const SUPABASE_URL =
    "https://jjoxrvcstonuzvfutcbl.supabase.co";

const SUPABASE_KEY =
    "sb_publishable_P2aV9jQxA9rTqkeXHdu23w_s5-HbjyC";

const supabaseClient =
    window.supabase.createClient(
        SUPABASE_URL,
        SUPABASE_KEY
    );


/* ==================================================
   Variables
   ================================================== */

let topics = [];
let currentTopicId = null;


/* ==================================================
   Load Topics
   ================================================== */

async function loadTopics() {

    const { data, error } =
        await supabaseClient
            .from("topic")
            .select("*")
            .order("created_at", {
                ascending: true
            });

    if (error) {

        console.error(
            "Topics error:",
            error
        );

        document.getElementById("topics").innerHTML = `
            <div class="empty">
                دریافت تاپیک‌ها با مشکل مواجه شد.
                <br><br>
                ${escapeHTML(error.message)}
            </div>
        `;

        return;
    }

    topics = data || [];

    await displayTopics(topics);
}


/* ==================================================
   Reply Count
   ================================================== */

async function getReplyCount(topicId) {

    const { count, error } =
        await supabaseClient
            .from("replies")
            .select("id", {
                count: "exact",
                head: true
            })
            .eq(
                "topic_id",
                topicId
            );

    if (error) {

        console.error(
            "Reply count error:",
            error
        );

        return 0;
    }

    return count || 0;
}


/* ==================================================
   Display Topics
   ================================================== */

async function displayTopics(list = topics) {

    const container =
        document.getElementById("topics");

    const countElement =
        document.getElementById("topicCount");


    if (!container) {
        return;
    }


    if (countElement) {

        countElement.textContent =
            list.length + " تاپیک";
    }


    if (list.length === 0) {

        container.innerHTML = `
            <div class="empty">
                هنوز تاپیکی ساخته نشده 😕
                <br>
                اولین تاپیک را شما بسازید 💜
            </div>
        `;

        return;
    }


    container.innerHTML = "";


    const reversed =
        [...list].reverse();


    for (const topic of reversed) {

        const replyCount =
            await getReplyCount(topic.id);


        const div =
            document.createElement("div");

        div.className = "topic";


        div.onclick = function () {

            openTopic(topic.id);

        };


        const title =
            escapeHTML(
                topic.title || ""
            );


        const username =
            escapeHTML(
                topic.username || "ناشناس"
            );


        /* مهم:
           ستون دیتابیس اسمش Text است
        */

        const text =
            String(
                topic.Text || ""
            );


        const preview =
            escapeHTML(
                text.substring(0, 120)
            );


        div.innerHTML = `

            <h3>
                ${title}
            </h3>

            <div class="topic-info">

                توسط ${username}

                • ${formatDate(
                    topic.created_at
                )}

                • ${replyCount} پاسخ

            </div>

            <div class="topic-preview">

                ${preview}

                ${
                    text.length > 120
                        ? "..."
                        : ""
                }

            </div>

        `;


        container.appendChild(div);
    }
}


/* ==================================================
   Open Topic Form
   ================================================== */

function openTopicForm() {

    const modal =
        document.getElementById(
            "topicModal"
        );


    if (!modal) {
        return;
    }


    modal.style.display =
        "block";


    document.getElementById(
        "username"
    ).value = "";


    document.getElementById(
        "topicTitle"
    ).value = "";


    document.getElementById(
        "topicText"
    ).value = "";
}


/* ==================================================
   Close Topic Form
   ================================================== */

function closeTopicForm() {

    const modal =
        document.getElementById(
            "topicModal"
        );


    if (modal) {

        modal.style.display =
            "none";
    }
}


/* ==================================================
   Create Topic
   ================================================== */

async function createTopic() {

    const username =
        document.getElementById(
            "username"
        ).value.trim();


    const title =
        document.getElementById(
            "topicTitle"
        ).value.trim();


    const text =
        document.getElementById(
            "topicText"
        ).value.trim();


    if (
        !username ||
        !title ||
        !text
    ) {

        alert(
            "لطفاً همه قسمت‌ها را پر کنید."
        );

        return;
    }


    if (
        username.length > 50
    ) {

        alert(
            "نام شما نباید بیشتر از ۵۰ کاراکتر باشد."
        );

        return;
    }


    if (
        title.length > 150
    ) {

        alert(
            "عنوان تاپیک نباید بیشتر از ۱۵۰ کاراکتر باشد."
        );

        return;
    }


    if (
        text.length > 5000
    ) {

        alert(
            "متن تاپیک نباید بیشتر از ۵۰۰۰ کاراکتر باشد."
        );

        return;
    }


    /* ==================================================
       Insert Topic

       ستون دیتابیس:
       Text
       ================================================== */

    const { data, error } =
        await supabaseClient
            .from("topic")
            .insert({

                title: title,

                Text: text,

                username: username

            })
            .select();


    if (error) {

        console.error(
            "Create topic error:",
            error
        );


        alert(
            "ساخت تاپیک انجام نشد.\n\n" +
            "خطای Supabase:\n" +
            error.message
        );

        return;
    }


    console.log(
        "Topic created:",
        data
    );


    document.getElementById(
        "username"
    ).value = "";


    document.getElementById(
        "topicTitle"
    ).value = "";


    document.getElementById(
        "topicText"
    ).value = "";


    closeTopicForm();


    await loadTopics();


    alert(
        "تاپیک با موفقیت ساخته شد 💜"
    );
}


/* ==================================================
   Open Topic
   ================================================== */

async function openTopic(id) {

    currentTopicId = id;


    const topic =
        topics.find(
            function (item) {

                return item.id === id;

            }
        );


    if (!topic) {
        return;
    }


    const content =
        document.getElementById(
            "topicContent"
        );


    if (!content) {
        return;
    }


    content.innerHTML = `

        <h2 class="topic-main-title">

            ${escapeHTML(
                topic.title || ""
            )}

        </h2>


        <div class="topic-author">

            توسط
            ${escapeHTML(
                topic.username || "ناشناس"
            )}

            •
            ${formatDate(
                topic.created_at
            )}

        </div>


        <div class="topic-body">

            ${escapeHTML(
                topic.Text || ""
            )}

        </div>


        <div id="repliesContainer">

            در حال دریافت پاسخ‌ها...

        </div>

    `;


    const modal =
        document.getElementById(
            "topicView"
        );


    if (modal) {

        modal.style.display =
            "block";
    }


    document.getElementById(
        "replyName"
    ).value = "";


    document.getElementById(
        "replyText"
    ).value = "";


    await loadReplies(id);
}


/* ==================================================
   Load Replies
   ================================================== */

async function loadReplies(topicId) {

    const container =
        document.getElementById(
            "repliesContainer"
        );


    if (!container) {
        return;
    }


    const { data, error } =
        await supabaseClient
            .from("replies")
            .select("*")
            .eq(
                "topic_id",
                topicId
            )
            .order("created_at", {
                ascending: true
            });


    if (error) {

        console.error(
            "Replies error:",
            error
        );


        container.innerHTML = `
            <p>
                دریافت پاسخ‌ها ناموفق بود.
                <br><br>
                ${escapeHTML(error.message)}
            </p>
        `;

        return;
    }


    if (
        !data ||
        data.length === 0
    ) {

        container.innerHTML = `

            <h3>
                پاسخ‌ها
            </h3>

            <p
                style="
                    color:#777;
                    margin:15px 0;
                "
            >
                هنوز کسی پاسخ نداده است.
            </p>

        `;

        return;
    }


    let html =
        "<h3>پاسخ‌ها</h3>";


    data.forEach(
        function (reply) {

            html += `

                <div class="reply">

                    <strong>

                        ${escapeHTML(
                            reply.username ||
                            "ناشناس"
                        )}

                    </strong>


                    <small>

                        ${formatDate(
                            reply.created_at
                        )}

                    </small>


                    <div>

                        ${escapeHTML(
                            reply.text || ""
                        )}

                    </div>

                </div>

            `;

        }
    );


    container.innerHTML =
        html;
}


/* ==================================================
   Close Topic
   ================================================== */

function closeTopic() {

    const modal =
        document.getElementById(
            "topicView"
        );


    if (modal) {

        modal.style.display =
            "none";
    }


    currentTopicId =
        null;
}


/* ==================================================
   Add Reply
   ================================================== */

async function addReply() {

    if (!currentTopicId) {

        alert(
            "تاپیک انتخاب نشده است."
        );

        return;
    }


    const name =
        document.getElementById(
            "replyName"
        ).value.trim();


    const text =
        document.getElementById(
            "replyText"
        ).value.trim();


    if (
        !name ||
        !text
    ) {

        alert(
            "لطفاً نام و پاسخ را وارد کنید."
        );

        return;
    }


    if (
        name.length > 50
    ) {

        alert(
            "نام شما نباید بیشتر از ۵۰ کاراکتر باشد."
        );

        return;
    }


    if (
        text.length > 2000
    ) {

        alert(
            "پاسخ نباید بیشتر از ۲۰۰۰ کاراکتر باشد."
        );

        return;
    }


    const { data, error } =
        await supabaseClient
            .from("replies")
            .insert({

                topic_id:
                    currentTopicId,

                username:
                    name,

                text:
                    text

            })
            .select();


    if (error) {

        console.error(
            "Reply error:",
            error
        );


        alert(
            "ارسال پاسخ انجام نشد.\n\n" +
            "خطای Supabase:\n" +
            error.message
        );

        return;
    }


    console.log(
        "Reply created:",
        data
    );


    document.getElementById(
        "replyName"
    ).value = "";


    document.getElementById(
        "replyText"
    ).value = "";


    await loadReplies(
        currentTopicId
    );


    await loadTopics();


    alert(
        "پاسخ با موفقیت ارسال شد 💜"
    );
}


/* ==================================================
   Search
   ================================================== */

async function searchTopics() {

    const input =
        document.getElementById(
            "searchInput"
        );


    if (!input) {
        return;
    }


    const query =
        input.value
            .toLowerCase()
            .trim();


    if (!query) {

        await displayTopics(
            topics
        );

        return;
    }


    const result =
        topics.filter(
            function (topic) {

                const title =
                    String(
                        topic.title || ""
                    ).toLowerCase();


                const text =
                    String(
                        topic.Text || ""
                    ).toLowerCase();


                const username =
                    String(
                        topic.username || ""
                    ).toLowerCase();


                return (
                    title.includes(query) ||
                    text.includes(query) ||
                    username.includes(query)
                );

            }
        );


    await displayTopics(
        result
    );
}


/* ==================================================
   Format Date
   ================================================== */

function formatDate(date) {

    if (!date) {
        return "";
    }


    const parsedDate =
        new Date(date);


    if (
        Number.isNaN(
            parsedDate.getTime()
        )
    ) {

        return "";
    }


    return parsedDate.toLocaleDateString(
        "fa-IR"
    );
}


/* ==================================================
   Security
   ================================================== */

function escapeHTML(text) {

    return String(text)

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


/* ==================================================
   Close Modal By Outside Click
   ================================================== */

window.addEventListener(
    "click",
    function (event) {

        const topicModal =
            document.getElementById(
                "topicModal"
            );


        const topicView =
            document.getElementById(
                "topicView"
            );


        if (
            topicModal &&
            event.target === topicModal
        ) {

            closeTopicForm();
        }


        if (
            topicView &&
            event.target === topicView
        ) {

            closeTopic();
        }

    }
);


/* ==================================================
   Start
   ================================================== */

async function init() {

    console.log(
        "Niki Family started."
    );


    await loadTopics();

}


init();
