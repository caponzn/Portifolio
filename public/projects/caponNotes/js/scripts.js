const host = "localhost"

const notesContainer = document.querySelector("#notes-container");
const noteInput = document.querySelector("#note-content");
const addNoteBtn = document.querySelector(".add-note");
const searchInput = document.querySelector("#search-input");


searchInput.addEventListener('keyup', (evt) => {
    evt.preventDefault()
    const termo = searchInput.value
    showNotes(termo)

})


async function showNotes(termo) {
    cleanNotes();
    const notes = await getNotes(termo)
    notes.forEach((note) => {
        const noteElement = createNote(note.id, note.titulo, note.fixed);
        notesContainer.appendChild(noteElement);
    });
}

function cleanNotes() {
    notesContainer.replaceChildren([]);
}

async function addNote() {

    const noteObject = {
        content: noteInput.value,
        fixed: false,
    };

    if (noteObject.content) {

        const newid = await saveNewNote(noteObject)

        if (newid) {
            const noteElement = createNote(newid, noteObject.content);
            notesContainer.appendChild(noteElement);

            noteInput.value = "";
        } else {
            alert('Erro ao adicionar Nota')
        }
    }
}

function createNote(id, content, fixed) {

    const element = document.createElement("div");

    element.classList.add("note");

    const textarea = document.createElement("textarea");

    textarea.value = content;

    textarea.placeholder = "Da ideia...";


    element.appendChild(textarea);

    const pinIcon = document.createElement("i");

    pinIcon.classList.add(...["bi", "bi-pin"]);

    element.appendChild(pinIcon);

    const deleteIcon = document.createElement("i");

    deleteIcon.classList.add(...["bi", "bi-x-lg"]);

    element.appendChild(deleteIcon);

    const duplicateIcon = document.createElement("i");

    duplicateIcon.classList.add(...["bi", "bi-file-earmark-plus"]);

    element.appendChild(duplicateIcon);

    if (fixed) {
        element.classList.add("fixed");
        
    }

    //eventos do elemento
    element.querySelector(".bi-pin").addEventListener("click", () => {
        toggleFixNote(id, element);
    });

    element.querySelector(".bi-x-lg").addEventListener("click", () => {
        deleteNote(id, element);
    });

    element.querySelector(".bi-file-earmark-plus").addEventListener("click", () => {
        copyNote(id, element);
    });

    textarea.addEventListener('blur', (evt) => {
        saveEditNote(id, evt, content)
    })

    return element;
}

function deleteNote(id, element) {
    if (confirm('Deseja deletar "' + id + '" ??')) {
        fetch(`http://${host}:3000/api/deletar/${id}`, { 'method': 'DELETE' })
            .then(res => {
                if (res.status == 204) {
                    notesContainer.removeChild(element);
                } else {
                    alert('Ocorreu um erro ao deletar tarefa')
                }
            })

    }

}

async function copyNote(id, targetNote) {

    const noteObject = {
        content: targetNote.querySelector('textarea').value,
        fixed: false,
    };


    if (noteObject.content) {

        const newid = await saveNewNote(noteObject)
        console.log(newid)
        if (newid) {
            const noteElement = createNote(newid, noteObject.content);
            notesContainer.appendChild(noteElement);

            noteInput.value = "";
        } else {
            alert('Erro ao adicionar Nota')
        }
    }

}

async function toggleFixNote(id, element) {
    fetch(`http://${host}:3000/api/togglefixed/${id}`,
        {
            'method': 'PUT',
            'headers': {
                'Accept': 'application/json',
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ id })
        }).then(res => {
            if (res.status == 204) {
                if (element.classList.contains('fixed')) {
                    element.classList.remove('fixed')
                } else {
                    element.classList.add('fixed')
                }

            } else {
                alert('Ocorreu um erro ao atualizar tarefa')
            }
        })

}

async function getNotes(termo) {
    // const notes = JSON.parse(localStorage.getItem("notes") || "[]");
    const notes = await (await fetch(`http://${host}:3000/api/listar?search=${termo}`)).json()

    //    const orderedNotes = notes.sort((a, b) => (a.fixed > b.fixed ? -1 : 1));
    return notes;
}
async function getNotesbyId(id) {
    // const notes = JSON.parse(localStorage.getItem("notes") || "[]");
    const notes = await (await fetch(`http://${host}:3000/api/listar/${id}`)).json()

    //    const orderedNotes = notes.sort((a, b) => (a.fixed > b.fixed ? -1 : 1));
    return notes;
}

async function saveNewNote(note) {

    
    const res = await fetch(`http://${host}:3000/api/criar`,
        {
            'method': 'POST',
            'headers': {
                'Accept': 'application/json',
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ "titulo": note.content, 'fixed': note.fixed })
        })

    const resJson = await res.json()

    console.log('note', resJson)
    return resJson.id
}

async function saveEditNote(id, evt, oldContent) {
    const newContent = evt.target.value
    if (newContent != oldContent) {
        // console.table({ oldContent, newContent })
        
        fetch(`http://${host}:3000/api/atualizar/${id}`,
            {
                'method': 'PUT',
                'headers': {
                    'Accept': 'application/json',
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ "titulo": newContent  })
            }).then(res => {
                if (res.status == 204) {
                    console.log('Note updated')
                } else {
                    alert('Ocorreu um erro ao atualizar tarefa')
                }
            })

    }
}

//Eventos
addNoteBtn.addEventListener("click", () => addNote());

//Inicialização
showNotes('');