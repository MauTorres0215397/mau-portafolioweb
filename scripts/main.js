const db = firebase.firestore();

const projectForm = document.getElementById("project-form"); //Form
const projectContainer = document.getElementById("project-container"); //contenedor donde se escriben los proyectos
const divAlert = document.getElementById("divAlert"); //donde va la alerta
const filterOpt = document.getElementById("project-filter"); //el filtro

const projectPage = document.getElementById("project-page"); //el todo

let editStatus = false; //bandera para editar
let id = ""; //id que se edita
let band = false;

let elements = [];

projectForm.addEventListener("submit", async (e) => {
  //el botón submit del Form
  e.preventDefault();

  const title = projectForm["project-title"];
  const description = projectForm["project-description"];
  const category = projectForm["project-category"];
  const img = projectForm["project-image"].files[0];

  let imgURL = null;

  if (img) {
    imgURL = await uploadImage(img);
  }

  if ((category.value == "Categoría..") | (title.value.length == 0)) {
    //validar si categoria o titulo están vacios
    if ((category.value == "Categoría..") & (title.value.length == 0)) {
      //alerta dependiendo de lo que falte
      divAlert.innerHTML = `<div class="alert alert-danger" role="alert">
                              Los proyectos deben tener <strong>titulo </strong>y<strong> categoría</strong>.
                            </div>`;
    } else if (category.value == "Categoría..") {
      divAlert.innerHTML = `<div class="alert alert-danger" role="alert">
                              Falta escoger una <strong>categoría</strong>.
                            </div>`;
    } else {
      divAlert.innerHTML = `<div class="alert alert-danger" role="alert">
                              Falta el <strong>título</strong>.
                            </div>`;
    }
  } else {
    if (!editStatus) {
      await saveProject(title.value, description.value, category.value, imgURL);
      divAlert.innerHTML = "";
    } else {
      if (img) {
        await updateProject(id, {
          title: title.value,
          description: description.value,
          category: category.value,
          imgURL: imgURL,
        });
      } else {
        await updateProject(id, {
          title: title.value,
          description: description.value,
          category: category.value,
        });
      }

      editStatus = false;
      id = "";
      projectForm["btn-project-form"].innerText = "Save";
      divAlert.innerHTML = "";
    }

    await getProjects();

    projectForm.reset();
    title.focus();
  }
});

window.addEventListener("DOMContentLoaded", async (e) => {
  //cuando se cargue
  //const querySnapshot = await getProject();

  filterOpt.onchange = function () {
    if (filterOpt.value == "No filter..") {
      projectContainer.innerHTML = "";

      elements.forEach((elements) => {
        projectContainer.innerHTML += projectTemplate(
          elements.title,
          elements.category,
          elements.imgURL,
          elements.color,
          elements.id
        );
      });
    } else {
      let filtered = elements.filter(
        (elements) => elements.category == filterOpt.value
      );
      projectContainer.innerHTML = "";

      filtered.forEach((filtered) => {
        projectContainer.innerHTML += projectTemplate(
          filtered.title,
          filtered.category,
          filtered.imgURL,
          filtered.color,
          filtered.id
        );
      });

      if (projectContainer.innerHTML == "") {
        projectContainer.innerHTML += `<h1 class="d-flex justify-content-center text-dark m-5">No hay elementos</h1>`;
      }
    }

    pageProject(); //para el botón de conocer más
  };
});

//autenticacion
//sign up -registrarge
const signupForm = document.querySelector("#signup-form");

signupForm.addEventListener("submit", (e) => {
  e.preventDefault(); //prevenir algo

  const signupEmail = document.querySelector("#signup-email").value;
  const signupPassword = document.querySelector("#signup-password").value;
  //console.log(signupEmail,signupPassword); //imprimimos el mail y la contraseña

  auth
    .createUserWithEmailAndPassword(signupEmail, signupPassword)
    .then((userCredential) => {
      signupForm.reset();

      $("#signupModal").modal("hide");
      //console.log("sign up");
    });
});

//sign in -iniciar sesión
const signinForm = document.querySelector("#login-form");

signinForm.addEventListener("submit", (e) => {
  e.preventDefault();

  const signinEmail = document.querySelector("#login-email").value;
  const signinPassword = document.querySelector("#login-password").value;
  //console.log(signinEmail, signinPassword);

  auth
    .signInWithEmailAndPassword(signinEmail, signinPassword)
    .then((userCredential) => {
      signinForm.reset();

      $("#signinModal").modal("hide");
      //console.log("sign in");
    });
});

const logout = document.querySelector("#logout");

logout.addEventListener("click", (e) => {
  e.preventDefault();

  auth.signOut().then(() => {
    //console.log("sign out");
  });
});

auth.onAuthStateChanged((user) => {
  if (user) {
    //console.log("signin"); //mostrar las cosas
    loginCheck(user);
  } else {
    //console.log("signout"); //ocultar las cosas
    loginCheck(user);
  }
});

const loggedOutLinks = document.querySelectorAll(".logged-out");
const loggedInLinks = document.querySelectorAll(".logged-in");
const crudForm = document.querySelector(".crud-form");
const textCrud = document.querySelector(".texto-crud");

const loginCheck = (user) => {
  if (user) {
    loggedInLinks.forEach((link) => (link.style.display = "inline"));
    loggedOutLinks.forEach((link) => (link.style.display = "none"));
    crudForm.style.display = "inline";
    textCrud.style.display = "none";

    onGetProject((querySnapshot) => {
      //si cambia algo en la BD se ejecuta esto
      projectContainer.innerHTML = "";
      let color = "";
      querySnapshot.forEach((doc) => {
        //console.log(doc.data());

        const project = doc.data();
        project.id = doc.id;

        switch (project.category) {
          case "Option1":
            color = "bg-op1";
            break;
          case "Option2":
            color = "bg-op2";
            break;
          case "Option3":
            color = "bg-op3";
            break;
        }

        if (!project.imgURL) {
          project.imgURL =
            "https://firebasestorage.googleapis.com/v0/b/mau-torres.appspot.com/o/img-placeholder.png?alt=media&token=558f794c-ed21-43e1-aca5-537305746639";
        }

        elements.push({
          title: project.title,
          description: project.description,
          category: project.category,
          imgURL: project.imgURL,
          color: color,
          id: project.id,
        });

        projectContainer.innerHTML += projectTemplate(
          project.title,
          project.category,
          project.imgURL,
          color,
          project.id
        );

        btnDeleteProject();
        btnEditProject();
        pageProject();
      });
    });
  } else {
    loggedInLinks.forEach((link) => (link.style.display = "none"));
    loggedOutLinks.forEach((link) => (link.style.display = "inline"));
    crudForm.style.display = "none";
    textCrud.style.display = "inline";
    band = false;

    projectContainer.innerHTML = "";
    elements = [];
  }
};

//google login 1:06:00
/*const googleButton = document.querySelector("#googleLogin");
googleButton.addEventListener("click", (e) => {
  const provider = new firebase.auth.GoogleAuthProvider();

  auth.signInWithPopup(provider)
    .then((result) => {
      console.log("google signin");
    })
    .catch((err) => {
      console.log(err);
    });
});*/

//funciones para la bd
const saveProject = (title, description, category, imgURL) =>
  db.collection("projects").doc().set({
    title,
    description,
    category,
    imgURL,
  });

const getProjects = () => db.collection("projects").get();

const onGetProject = (callback) =>
  db.collection("projects").onSnapshot(callback);

const deleteProject = (id) => db.collection("projects").doc(id).delete();

const getProject = (id) => db.collection("projects").doc(id).get();

const updateProject = (id, updateTask) =>
  db.collection("projects").doc(id).update(updateTask);

async function uploadImage(file) {
  const ref = firebase.storage().ref();
  const name = new Date() + "-" + file.name;
  const metadata = { contentType: file.type };
  const snapshot = await ref.child(name).put(file, metadata);
  const url = await snapshot.ref.getDownloadURL();
  return url;
}

const projectTemplate = (
  title,
  category,
  imgURL,
  color,
  id
) => `<div class="row">
            <div class="row pl-5 pt-3 ml-3">
                <div class="col  ${color} p-2 project border border-light ">
                    <img class="img-proyecto img-fluid" src="${imgURL}"/>
                    <h3 class="h3">${title}</h3>
                    <p>${category}</p>
                    <div class="crud-btn">
                      <button class="btn btn-danger btn-delete" data-id="${id}">Borrar</button>
                      <button class="btn btn-primary btn-edit" data-id="${id}">Editar</button>
                      <button class="btn btn-secondary btn-page" data-id="${id}">Conoce más..</button>
                    </div>
                </div>
            </div>
      </div>`;

const projectPageTemplate = (
  title,
  description,
  category,
  image,
  color
) => `<div class="container-fluid">
            <div class="row text-center">
                <div class="col text-center p-2">
                    <h1>${title}</h1>
                </div>
            </div>
            <div class="row">
                <div class="col">
                    <img src="${image}" class="mx-auto d-block mb-4 ${color} img-fluid ">
                </div>
                <div class="col d-flex align-items-center">
                    <p>${description}<br><br>Categoría: ${category}</p>
                </div>
            </div>
            <div class="row p-3">
                <a href="crud.html">
                    <button type="button" class="btn btn-primary">Regresar</button>
                </a>
            </div>
        </div>`;

//botones
const pageProject = () => {
  const btnsPage = document.querySelectorAll(".btn-page");
  btnsPage.forEach((btn) => {
    btn.addEventListener("click", async (e) => {
      const filtered = await elements.filter(
        //filtrado por id, el id es unico, devuelve un arreglo con un elemento
        (elements) => elements.id == e.target.dataset.id
      );

      projectPage.innerHTML = projectPageTemplate(
        filtered[0].title,
        filtered[0].description,
        filtered[0].category,
        filtered[0].imgURL,
        filtered[0].color
      );
    });
  });
};

const btnDeleteProject = () => {
  const btnsDelete = document.querySelectorAll(".btn-delete");
  btnsDelete.forEach((btn) => {
    btn.addEventListener("click", async (e) => {
      await deleteProject(e.target.dataset.id);
    });
  });
};

const btnEditProject = () => {
  const btnsEdit = document.querySelectorAll(".btn-edit");
  btnsEdit.forEach((btn) => {
    btn.addEventListener("click", async (e) => {
      const doc = await getProject(e.target.dataset.id);
      const project = doc.data();

      editStatus = true;
      id = doc.id;

      projectForm["project-title"].value = project.title;
      projectForm["project-description"].value = project.description;
      projectForm["project-category"].value = project.category;

      projectForm["btn-project-form"].innerText = "Update";
    });
  });
};
