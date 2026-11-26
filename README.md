# Soft Bank — demonstração

Mockup de uma página de produtos de pagamento. Não existe autenticação, conta, pedido ou pagamento real. A interface visual usa fontes e bibliotecas externas.

## Rodar localmente

Na raiz do repositório, execute:

```sh
python3 -m http.server 8000 --bind 127.0.0.1
```

Abra <http://localhost:8000/>.

## Estrutura

`soft_bank_premium.html`: página da demonstração. `index.html`: entrada que preserva a URL anterior.

A CI valida o HTML e verifica arquivos e âncoras locais. Links e serviços externos não são consultados pela CI.
