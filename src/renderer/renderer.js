document.addEventListener('DOMContentLoaded', () => {
    let current = location.pathname.split('/');
    if (current === "") {
        return;
    }
    const url = current.at(-1);

    const sidebar = document.getElementById('sidebar');
    sidebar.innerHTML = `
			<h1><a href="#" class="logo"><img class="img-fluid px-2" src="./assets/images/logo.png"/></a></h1>
			<ul class="list-unstyled components mb-5">
				<li class="active">
					<a href="index.html"><i data-feather="home"></i></a>
				</li>
				<li>
					<a href="lista.html"><i data-feather="users"></i></a>
				</li>
				<li>
					<a href="configuracoes.html"><i data-feather="settings"></i></a>
				</li>
			</ul>`;

    feather.replace();
    if (url == 'configuracoes.html') {
        document.querySelector('#botao-importar').addEventListener('click', async function (event) {
            event.preventDefault();
            const filePath = await window.api.openFileDialog();
            atualizarListaInscritos(filePath);
        });

        carregarIP();
    }

    if (url == 'index.html') {
        carregarTotalizadores();
    }
});

async function carregarInscritos() {
    const response = await window.api.listarInscritos();
    $('#inscritos').DataTable({
        data: response,
        columns: [
            { "data": "nome" },
            { "data": "codigo" },
            { "data": "estado" },
            {
                render: function (data, type, result) {
                    let color = result.status == 1 ? 'success' : 'danger';
                    let msg = result.status == 1 ? 'Realizado' : 'Pendente';
                    
                    return `<span class="badge badge-${color}">${msg}</span>`;
                }
            },
            { "data": "quarto" }
        ],
        scroller: {
          loadingIndicator: true
        },
    });
}

async function atualizarListaInscritos(filePath) {
    const response = await window.api.importarInscritos(filePath);
}

async function carregarTotalizadores() {
    const response = await window.api.totalizadores();
    let total = 0;
    let totalPendente = 0;
    response.forEach(element => {
        if (element.status == 0) {
            totalPendente = element.total;
            document.getElementById('total_pendente').innerText = element.total;
        } else {
            document.getElementById('total_confirmado').innerText = element.total;
        }
        total += element.total;
    });

    if (totalPendente > 4) {
        setTimeout(carregarTotalizadores, 5000);
    }
    document.getElementById('total_inscritos').innerText = total;
}

async function carregarIP() {
    const response = await window.api.carregarIp();
    document.getElementById('ip-usuario').innerText = response;
}



window.api.onUpdateCounter((value) => {
    carregarTotalizadores();
})