document.addEventListener('DOMContentLoaded', () => {
    const sidebar = document.getElementById('sidebar');
    sidebar.innerHTML = `
			<h1><a href="#" class="logo">M.</a></h1>
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
    if (document.querySelector('#botao-importar') != null) {
        document.querySelector('#botao-importar').addEventListener('click', async function (event) {
            event.preventDefault();
            const filePath = await window.api.openFileDialog();
            atualizarListaInscritos(filePath);
        });
    }
});

async function teste() {
    const response = await window.api.ping();

    console.log(response);
}

async function carregarInscritos() {
    const response = await window.api.listarInscritos();
    $('#inscritos').DataTable({
        data: response,
        columns: [
            { "data": "nome" },
            { "data": "codigo" },
            { "data": "quarto" },
            {
                render: function (data, type, result) {
                    let color = result.status == 1 ? 'success' : 'danger';
                    let msg = result.status == 1 ? 'Realizado' : 'Pendente';
                    
                    return `<span class="badge badge-${color}">${msg}</span>`;
                }
            },
            { "data": "chave" }
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
}
