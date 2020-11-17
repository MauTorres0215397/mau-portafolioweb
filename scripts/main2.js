const db = firebase.firestore();

const projectContainer = document.getElementById("project-container"); //contenedor donde se escriben los proyectos
const filterOpt = document.getElementById("project-filter"); //el filtro

const projectPage = document.getElementById("project-page"); //el todo

let editStatus = false; //bandera para editar
let id = ""; //id que se edita

let elements = [];

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

  onGetProject((querySnapshot) => {
    //si cambia algo en la BD se ejecuta esto
    projectContainer.innerHTML = "";
    let color = "";
    querySnapshot.forEach((doc) => {
      //console.log(doc.data());

      const project = doc.data();
      project.id = doc.id;

      //marco color
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

      pageProject(); //para el botón de conocer más
    });
  });
});

const onGetProject = (callback) =>
  db.collection("projects").onSnapshot(callback);

const getProject = (id) => db.collection("projects").doc(id).get();

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
                    <button class="btn btn-secondary btn-page" data-id="${id}">Conoce más..</button>
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
                <a href="projects.html">
                    <button type="button" class="btn btn-primary">Regresar</button>
                </a>
            </div>
        </div>`;

const pageProject = () => {
  const btnsPage = document.querySelectorAll(".btn-page");
  btnsPage.forEach((btn) => {
    btn.addEventListener("click", async (e) => {
      const filtered = await elements.filter( //filtrado por id, el id es unico, devuelve un arreglo con un elemento
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
