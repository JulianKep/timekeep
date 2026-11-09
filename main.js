//get handle of top level element
let container = document.getElementById("container");

//global variables
let user_id = "";
let timer_running = false;
let start_time = new Date();
let end_time = new Date();
let time_passed = 1;
const db = window.supabase.createClient(
    "https://ezjzdwtxoufuhrrppspk.supabase.co",
    "sb_publishable_wDCgMIF9jJuHnt4Ur5XU7Q_Tt4ZU7Hn"
);

//function that reloads all functions that create ui elements that need to be updated
function reload_ui(){
    display_times()
}

//

function show_timer(){

    container.innerHTML = `
    <h1>TIMER</h1>
        <button id="time-btn">start</button>
        <p id="timer">
            00:00:00
         </p>
    <p id="tags"></p>
    <br/>
    <div id="buttons">
        <button id="download-all">download data</button>
        <button id="delete-btn">delete data</button>
    </div>
    `

    reload_ui();

    document.getElementById("time-btn").addEventListener("click", async () => {

        if (timer_running){
            document.getElementById("time-btn").innerText = "start";

            end_time = new Date();
            clearInterval(interval);

            await speichern();

            reload_ui();

            timer_running = false;
        } else {
            document.getElementById("time-btn").innerText = "end";

            start_time = new Date();
            interval = setInterval(() => {
                document.querySelector("#timer").textContent = `${String(Math.floor(time_passed / 3600)).padStart(2, "0")}:${String(Math.floor(time_passed / 60)).padStart(2, "0")}:${String(time_passed % 60).padStart(2, "0")}`
                time_passed += 1;
            }, 1000);

            timer_running = true;
        }

    })

    document.getElementById("download-all").addEventListener("click", async (event) => {                                       // AI-GENERATED
        const button = event.currentTarget;                                                                                    //
        const exportUserId = user_id;                                                                                          //
        if (!exportUserId) return;                                                                                             //
        button.disabled = true;                                                                                                //
        try {                                                                                                                  //
            const entries = [];                                                                                                //
            let offset = 0;                                                                                                    //
            while (true) {                                                                                                     //
                const { data, error } = await db                                                                               //
                    .from("time")                                                                                              //
                    .select("id,start,end")                                                                                    //
                    .eq("user_id", exportUserId)                                                                               //
                    .order("start", { ascending: true })                                                                       //
                    .order("id", { ascending: true })                                                                          //
                    .range(offset, offset + 999);                                                                              //
                if (error) throw error;                                                                                        //
                if (!data.length) break;                                                                                       //
                entries.push(...data);                                                                                         //
                offset += data.length;                                                                                         //
            }                                                                                                                  //
            if (!entries.length) {                                                                                             //
                alert("Keine gespeicherten Zeiten vorhanden.");                                                                //
                return;                                                                                                        //
            }                                                                                                                  //
            const lines = [];                                                                                                  //
            let previousDate = "";                                                                                             //
            let previousMonth = "";                                                                                            //
            for (const entry of entries) {                                                                                     //
                const start = new Date(entry.start);                                                                           //
                const end = new Date(entry.end);                                                                               //
                const date = start.toLocaleDateString("de-DE");                                                                //
                const month = start.toLocaleDateString("de-DE", { month: "long", year: "numeric" });                           //
                if (month !== previousMonth) {                                                                                 //
                    if (lines.length) lines.push("");                                                                          //
                    lines.push(month, "#".repeat(month.length));                                                               //
                    previousMonth = month;                                                                                     //
                }                                                                                                              //
                if (date !== previousDate) {                                                                                   //
                    if (lines.length) lines.push("");                                                                          //
                    lines.push(date, "=".repeat(date.length));                                                                 //
                    previousDate = date;                                                                                       //
                }                                                                                                              //
                const seconds = Math.floor((end - start) / 1000);                                                              //
                const duration = [                                                                                             //
                    Math.floor(seconds / 3600),                                                                                //
                    Math.floor(seconds / 60) % 60,                                                                             //
                    seconds % 60                                                                                               //
                ].map(value => String(value).padStart(2, "0")).join(":");                                                      //
                lines.push("[" + duration + "] " + start.toLocaleTimeString("de-DE") + " bis " + end.toLocaleString("de-DE")); //
            }                                                                                                                  //
            const blob = new Blob(["\uFEFF", lines.join("\r\n") + "\r\n"], { type: "text/plain;charset=utf-8" });              //
            const url = URL.createObjectURL(blob);                                                                             //
            const link = document.createElement("a");                                                                          //
            link.href = url;                                                                                                   //
            link.download = "zeitstempel.txt";                                                                                 //
            document.body.appendChild(link);                                                                                   //
            link.click();                                                                                                      //
            link.remove();                                                                                                     //
            setTimeout(() => URL.revokeObjectURL(url), 1000);                                                                  //
        } catch (error) {                                                                                                      //
            console.error("Download fehlgeschlagen:", error);                                                                  //
            alert("Die Zeitstempel konnten nicht heruntergeladen werden.");                                                    //
        } finally {                                                                                                            //
            button.disabled = false;                                                                                           //
        }                                                                                                                      //
    });                                                                                                                        // AI-GENERATED

    document.getElementById("delete-btn").addEventListener("click", async () => {
        await delete_all_data();
        reload_ui();
    });

    document.getElementById("tags").addEventListener("click", (e) => {
        if (e.target.tagName === "BUTTON") {
            delete_entry(e.target.parentElement.id);
        }
    });
}




document.getElementById("login-form").addEventListener("submit", async (event) => {
    event.preventDefault();

    email = document.getElementById('name').value
    password = document.getElementById('password').value

    const { data, error} = await db.auth.signInWithPassword({
        email: email,
        password: password,
    });

    if (error) {
        console.error(error.message);
        return;
    }

    user_id = data.user.id;
    show_timer();

})

async function restore_login() {
    const { data: { session }, error } = await db.auth.getSession();

    if (error) {
        console.error(error.message);
        return;
    }

    if (session) {
        user_id = session.user.id;
        show_timer();
    }
}

restore_login();


async function delete_all_data(){

    const response = await db
        .from("time")
        .delete()
        .eq("user_id", user_id)

    console.log(response.status, response.statusText);
}

async function delete_entry(id){

    const response = await db
        .from("time")
        .delete()
        .eq("id", id)

    console.log(response.status, response.statusText);

    reload_ui();
}



async function speichern() {


    const duration = end_time - start_time;

    const { error } = await db.from("time").insert({
        user_id: user_id,
        start: start_time.toISOString(),
        end: end_time.toISOString(),
        duration: duration,
    });
    console.log(error ? error.message : "saved data");
}



async function display_times(){

    let tags = document.getElementById("tags");

    const { data: zeilen, error } = await db
        .from("time")
        .select("")
        .eq("user_id", user_id)
        .order("start", { ascending: false});

    console.log(error ? error.message : "request okay");

    tags.innerHTML = "";

    let total_duration = 0;

    let dateSet = new Set([]);
    let contidionalHeading = ``

    for (const element of zeilen){
        const start = new Date(element.start)
        const end = new Date(element.end)
        const date = start.toLocaleDateString("de-DE", {
            day: "2-digit",
            month: "2-digit",
            year: "numeric"
        });

        if(dateSet.has(date)){
            contidionalHeading = ``
        }else{
            dateSet.add(date)
            contidionalHeading = `<span class="date-heading">${date}</span>`
        }

        let dur = end - start;
        total_duration += dur

        dur  = Math.floor(dur / 1000);

        tags.innerHTML += contidionalHeading
        tags.innerHTML += `<span id="${element.id}" class="time-entry"><span>[${String(Math.floor(dur / 3600)).padStart(2, "0")}:${String(Math.floor(dur / 60)).padStart(2, "0")}:${String(dur % 60).padStart(2, "0")}]   `
        + start.toLocaleTimeString("de-DE") + " To " + end.toLocaleTimeString("de-DE") + '</span><button class="del" type="button">delete</button></span>'
    }

    //convert from milliseconds to seconds
    total_duration = Math.floor(total_duration / 1000);

    tags.innerHTML += `Total: <span class="total-number">${String(Math.floor(total_duration / 3600)).padStart(1, "0")}</span> Hours <span class="total-number">${String(Math.floor(total_duration / 60)).padStart(1, "0")}</span> Minutes <span class="total-number">${String(total_duration % 60).padStart(1, "0")}</span> Seconds`
}

