# Ativar capacidade de IA

## Contexto
O usuário pediu para habilitar as capacidades de IA (texto, imagem e vídeo) no projeto. Isso é um pré-requisito para qualquer funcionalidade futura baseada em IA (chatbot, geração de texto/imagem/vídeo, etc.). O Enter Cloud já está habilitado no projeto, então o requisito para ativar a IA está atendido.

Atualmente não existe nenhuma função de backend relacionada a IA (`supabase/functions/` só tem `manage-team-user`). Este passo apenas provisiona o acesso/token de IA — nenhuma feature específica de IA será implementada agora, pois o usuário não pediu uma funcionalidade concreta ainda.

## Abordagem
1. Chamar a ferramenta `enable_ai_capability` para solicitar a confirmação do usuário e provisionar o token de IA nos segredos do Enter Cloud.
2. Não criar nenhuma função de backend ou UI nova nesta etapa, já que o usuário não especificou qual funcionalidade de IA deseja construir.
3. Após a ativação, perguntar ao usuário qual funcionalidade de IA ele quer construir (chat, geração de imagem, geração de vídeo, etc.) para então carregar a skill apropriada (`enter_llm_integration`, `enter_image_generation`, `enter_video_generation`) e implementar.

## Implementation checklist
- [passed] Chamar `enable_ai_capability` para provisionar o token de IA nos segredos do Enter Cloud
- [passed] Confirmar que o token foi criado (ex.: `AI_API_TOKEN_xxx`) sem expor o valor ao usuário

## Verification checklist
- [passed] Confirmar via resposta da ferramenta que a ativação foi bem-sucedida
- [passed] Nenhuma alteração de código/arquivo é necessária nesta etapa (build/lint não são afetados)
