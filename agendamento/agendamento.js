 function confirmarAgendamento() {
      const vacinaSelecionada = document.querySelector('input[name="vacina"]:checked');
      const data = document.getElementById("data").value;
      const hora = document.getElementById("hora").value;
      const resumo = document.getElementById("resumo");

      if (!vacinaSelecionada) {
        alert("Por favor, selecione uma vacina.");
        return;
      }

      if (!data || !hora) {
        alert("Por favor, informe a data e hora.");
        return;
      }

      resumo.innerText = `✅ Vacina: ${vacinaSelecionada.value} agendada para ${data} às ${hora}`;
    }