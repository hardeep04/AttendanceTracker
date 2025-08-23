// ------------------- Fetch and Render -------------------
async function fetchSubjects() {
  let res = await fetch("/api/subjects/");
  let subjects = await res.json();

  let container = document.getElementById("subjects");
  container.innerHTML = "";

  subjects.forEach((subj) => {
    container.innerHTML += `
      <div class="col-md-4 col-sm-6">
        <div class="card subject-card shadow-sm mb-3">
        <div class="card-body">
          <div class="d-flex justify-content-between align-items-center">
            <h5 class="card-title">${subj.name}</h5>
            <button class="btn btn-sm btn-outline-danger" onclick="deleteSubject(${subj.id}, '${subj.name}')">🗑️</button>
          </div>
          
          <div class="mt-3" id="attendance-${subj.id}"></div>

          <div class="mt-3">
            <div class="d-flex gap-2 flex-wrap">
              
              <button class="btn btn-primary btn-sm" onclick="updateAttendance(${subj.id}, 'present', 1)">+</button>
              <span>Present</span>
              <button class="btn btn-outline-primary btn-sm" onclick="updateAttendance(${subj.id}, 'present', -1)">-</button>
              
            </div>

              <div class="w-100 my-2">

              <button class="btn btn-danger btn-sm" onclick="updateAttendance(${subj.id}, 'absent', 1)">+</button>
              <span class="mx-1">Absent</span>
              <button class="mx-1 btn btn-outline-danger btn-sm" onclick="updateAttendance(${subj.id}, 'absent', -1)">-</button>
              
              </div>
          </div>
        </div>
      </div>
      </div>
    `;
    
    fetchAttendance(subj.id);
  });
}

// ------------------- Add Subject -------------------
async function addSubject() {
  let name = document.getElementById("subjectInput").value.trim();
  if (!name) return;

  await fetch("/api/subjects/", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "X-CSRFToken": getCookie("csrftoken"),
    },
    body: JSON.stringify({ name }),
  });

  showToast(`Subject : ${name} has been added ✅`);

  document.getElementById("subjectInput").value = "";
  fetchSubjects();
}

// ------------------- Update Attendance (+ / - buttons) -------------------
async function updateAttendance(subjectId, type, delta) {
  let res = await fetch(`/api/attendance/`);
  let records = await res.json();
  let record = records.find(r => r.subject === subjectId);

  if (!record) {
    // create record if missing
    record = await (await fetch(`/api/attendance/`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "X-CSRFToken": getCookie("csrftoken"),
      },
      body: JSON.stringify({ subject: subjectId, present: 0, total: 0 })
    })).json();
  }

  let present = record.present;
  let total = record.total;
  

  if (type === "present") {
    present += delta;
    total += delta;
  } else if (type === "absent") {
    total += delta;
  }

  // prevent invalid values
  if (present < 0) present = 0;
  if (total < 0) total = 0;
  if (present > total) present = total;


  await fetch(`/api/attendance/${record.id}/`, {
    method: "PATCH",
    headers: {
      "Content-Type": "application/json",
      "X-CSRFToken": getCookie("csrftoken"),
    },
    body: JSON.stringify({ present, total }),
  });

  fetchAttendance(subjectId);
}

// ------------------- Fetch Attendance -------------------
async function fetchAttendance(subjectId) {
  let res = await fetch(`/api/attendance/`);
  let records = await res.json();
  let record = records.find(r => r.subject === subjectId);

  let div = document.getElementById(`attendance-${subjectId}`);
  if (record) {
    let percent = record.total > 0 ? (record.present / record.total * 100).toFixed(2) : 0;
    div.innerHTML = `
      <p>Present: ${record.present}, Total: ${record.total}</p>
      <div class="progress" style="height: 20px;">
        <div class="progress-bar ${percent < 75 ? "bg-danger" : "bg-success"}" 
             role="progressbar" style="width: ${percent}%;">
          ${percent}%
        </div>
      </div>
      <p class="${percent >= 75 ? "ok" : "low"} mt-2">
      Status: ${percent >= 75 ? `Safe ✅ Can leave next ${Math.floor((4*record.present - 3*record.total)/3)} classes` 
        : `Low ❌ Attend atleast ${3*record.total - 4*record.present} classes more`}
      </p>
    `;
  } else {
    div.innerHTML = `<p>No attendance yet.</p>`;
  }
}

// ------------------- Delete Subject -------------------
async function deleteSubject(subjectId, subjectName) {
  if (!confirm("Are you sure you want to delete this subject?")) return;

  await fetch(`/api/subjects/${subjectId}/`, {
    method: "DELETE",
    headers: { "X-CSRFToken": getCookie("csrftoken") },
  });
  // let name = document.getElementById(subjectId).value;
  fetchSubjects();
  showToast(`Subject : ${subjectName} deleted successfully ✅`, "success");
}

function showToast(message, type = "success") {
  const toastEl = document.getElementById("liveToast");
  const toastBody = toastEl.querySelector(".toast-body");

  // change message
  toastBody.textContent = message;

  // change color based on type
  toastEl.className = `toast align-items-center text-bg-${type} border-0`;

  const toast = new bootstrap.Toast(toastEl);
  toast.show();
}


// ------------------- CSRF Helper -------------------
function getCookie(name) {
  let cookieValue = null;
  if (document.cookie && document.cookie !== '') {
    const cookies = document.cookie.split(';');
    for (let cookie of cookies) {
      cookie = cookie.trim();
      if (cookie.startsWith(name + '=')) {
        cookieValue = decodeURIComponent(cookie.substring(name.length + 1));
        break;
      }
    }
  }
  return cookieValue;
}

// ------------------- Init -------------------
fetchSubjects();
