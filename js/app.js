const kumpulanBuku = [];
const RENDER = "render-buku";
const STORAGE_KEY = "KUMPULAN_BUKU";
const SAVED_EVENT = "saved";
let updatePercobaan = false;
const dialogView = document.querySelector(".dialog");

document.addEventListener("DOMContentLoaded", function () {
  const inputUserForm = document.getElementById("inputBook");
  const pencarianForm = document.getElementById("pencarianJudulBuku");
  const btn = document.getElementById("bookSubmit");

  if (isStorageExist()) {
    loadDataFromStorage();
  }

  inputUserForm.addEventListener("submit", function (e) {
    e.preventDefault();
    tambahBuku();
    updatePercobaan = false;
    btn.textContent = "Add";
    resetInput();
  });

  pencarianForm.addEventListener("submit", function (e) {
    e.preventDefault();
    cariBukuHandler();
  });
});

document.addEventListener(RENDER, function () {
  const belumDibaca = document.getElementById("daftarBukuBelumDibaca");
  belumDibaca.innerHTML = "";

  const sudahDibaca = document.getElementById("daftarBukuSudahDibaca");
  sudahDibaca.innerHTML = "";

  for (const buku of kumpulanBuku) {
    const bukuElement = ElementCardBuku(buku);
    if (buku.isComplete) {
      sudahDibaca.append(bukuElement);
    } else {
      belumDibaca.append(bukuElement);
    }
  }

  resetInput();
});

function tambahBuku() {
  const judul = document.getElementById("inputBookTitle").value;
  const penulis = document.getElementById("inputBookAuthor").value;
  const tahun = document.getElementById("inputBookYear").value;
  const isComplete = document.getElementById("inputBookIsComplete").checked;
  const idExisting = parseInt(document.getElementById("idBook").value);
  const id = idUnik();

  if (updatePercobaan == false) {
    const obj = ubahObj(id, judul, penulis, tahun, isComplete);
    kumpulanBuku.push(obj);
  } else {
    for (let i = 0; i < kumpulanBuku.length; i++) {
      if (kumpulanBuku[i].id === idExisting) {
        updateHandler(idExisting, judul, penulis, tahun, isComplete);
      }
    }
  }

  document.dispatchEvent(new Event(RENDER));
  saveData();
}

function updateHandler(id, judulBaru, penulisBaru, tahunBaru, isCompleteBaru) {
  for (let i = 0; i < kumpulanBuku.length; i++) {
    if (kumpulanBuku[i].id === id) {
      kumpulanBuku[i].id = id;
      kumpulanBuku[i].judul = judulBaru;
      kumpulanBuku[i].penulis = penulisBaru;
      kumpulanBuku[i].tahun = tahunBaru;
      kumpulanBuku[i].isComplete = isCompleteBaru;
      const parsed = JSON.stringify(kumpulanBuku[i]);
      localStorage.setItem(STORAGE_KEY, parsed);
    }
  }
}

function ElementCardBuku(data) {
  const judul = document.createElement("h3");
  judul.innerText = data.judul;

  const penulis = document.createElement("p");
  penulis.innerText = data.penulis;

  const tahun = document.createElement("p");
  tahun.innerText = data.tahun;

  const desc = document.createElement("div");
  desc.classList.add("desc");
  desc.append(judul);
  desc.append(penulis);
  desc.append(tahun);

  const actionButton = document.createElement("div");
  actionButton.classList.add("action");

  const divButton = document.createElement("button");
  divButton.classList.add("green");

  const deletebutton = document.createElement("button");
  deletebutton.innerText = "Hapus buku";
  deletebutton.classList.add("red");

  actionButton.append(divButton);
  actionButton.append(deletebutton);

  deletebutton.addEventListener("click", function () {
    confirm(data.id);
  });

  judul.addEventListener("click", function () {
    const btn = document.getElementById("bookSubmit");
    const index = cariId(data.id);
    btn.textContent = "Update";
    document.getElementById("inputBookTitle").value = index.judul;
    document.getElementById("inputBookAuthor").value = index.penulis;
    document.getElementById("inputBookYear").value = index.tahun;
    document.getElementById("inputBookIsComplete").checked = index.isComplete;
    document.getElementById("idBook").value = index.id;
    updatePercobaan = true;
  });

  if (data.isComplete) {
    divButton.innerText = "Belum Selesai dibaca";
    divButton.addEventListener("click", function () {
      belumSelesaiDibacaHandler(data.id);
    });
  } else {
    divButton.innerText = "Selesai dibaca";
    divButton.addEventListener("click", function () {
      sudahSelesaiDibacaHandler(data.id);
    });
  }

  const article = document.createElement("article");
  article.classList.add("book_item");
  article.append(desc);
  article.append(actionButton);

  return article;
}

function ubahObj(id, judul, penulis, tahun, isComplete) {
  return {
    id: id,
    judul: judul,
    penulis: penulis,
    tahun: tahun,
    isComplete: isComplete,
  };
}

function idUnik() {
  return Date.now();
}

function deleteHandler(id) {
  const index = kumpulanBuku.findIndex(function (buku) {
    return buku.id == id;
  });
  if (index === -1) return;

  kumpulanBuku.splice(index, 1);
  document.dispatchEvent(new Event(RENDER));
  saveData();
}

function belumSelesaiDibacaHandler(id) {
  const index = cariId(id);

  index.isComplete = false;
  document.dispatchEvent(new Event(RENDER));
  saveData();
}

function sudahSelesaiDibacaHandler(id) {
  const index = cariId(id);

  index.isComplete = true;
  document.dispatchEvent(new Event(RENDER));
  saveData();
}

function cariId(id) {
  for (const buku of kumpulanBuku) {
    if (buku.id == id) {
      return buku;
    }
  }
  return null;
}

function isStorageExist() {
  if (typeof Storage === undefined) {
    return false;
  }
  return true;
}

function loadDataFromStorage() {
  const storage = localStorage.getItem(STORAGE_KEY);
  const data = JSON.parse(storage);

  if (data != null) {
    for (const buku of data) {
      kumpulanBuku.push(buku);
    }
  }

  document.dispatchEvent(new Event(RENDER));
}

function saveData() {
  if (isStorageExist()) {
    const parsed = JSON.stringify(kumpulanBuku);
    localStorage.setItem(STORAGE_KEY, parsed);
    document.dispatchEvent(new Event(SAVED_EVENT));
  }
}

function cariBukuHandler() {
  const inputPencarian = document.getElementById("cariJudul").value.toLowerCase();
  const article = document.querySelectorAll(".book_item");

  cariJudul(inputPencarian, article);
  inputPencarian.value = "";
}

function cariJudul(dicari, elemen) {
  for (let i = 0; i < elemen.length; i++) {
    if (elemen[i].firstChild.textContent.toLowerCase().indexOf(dicari) > -1) {
      elemen[i].style.display = "";
    } else {
      elemen[i].style.display = "none";
    }
  }
}

function resetInput() {
  document.getElementById("inputBookTitle").value = "";
  document.getElementById("inputBookAuthor").value = "";
  document.getElementById("inputBookYear").value = "";
  document.getElementById("inputBookIsComplete").checked = false;
  document.getElementById("idBook").value = "";
}

function confirm(id) {
  const main = document.querySelector(".main");

  const divDialog = document.createElement("div");
  divDialog.classList.add("dialog", "container");

  const divTitle = document.createElement("div");
  divTitle.classList.add("title");

  const h4 = document.createElement("h4");
  h4.textContent = "Apakah anda yakin akan menghapus?";

  divTitle.append(h4);

  const divChoose = document.createElement("div");
  divChoose.classList.add("choose");

  const hapus = document.createElement("button");
  hapus.classList.add("hapus");
  hapus.textContent = "Hapus";
  hapus.addEventListener("click", function () {
    divDialog.remove();
    deleteHandler(id);
  });

  const batal = document.createElement("button");
  batal.classList.add("batal");
  batal.textContent = "batal";
  batal.addEventListener("click", function () {
    divDialog.remove();
  });

  divChoose.append(hapus);
  divChoose.append(batal);

  divDialog.append(divTitle);

  divDialog.append(divChoose);

  main.append(divDialog);
  return main;
}
