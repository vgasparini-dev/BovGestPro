import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import type { User } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

function json(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders, 'Content-Type': 'application/json' },
  });
}

type CallerProfile = {
  id: string;
  farm_id: string;
  role: string;
};

async function getCallerProfile(authHeader: string): Promise<CallerProfile | null> {
  const supabase = createClient(
    Deno.env.get('SUPABASE_URL')!,
    Deno.env.get('SUPABASE_ANON_KEY') || Deno.env.get('SUPABASE_PUBLISHABLE_KEY')!,
    { global: { headers: { Authorization: authHeader } } },
  );

  const { data: { user }, error: userErr } = await supabase.auth.getUser();
  if (userErr || !user) return null;

  const { data, error } = await supabase
    .from('profiles')
    .select('id, farm_id, role')
    .eq('id', user.id)
    .maybeSingle();

  if (error || !data) return null;
  return { id: data.id, farm_id: data.farm_id, role: data.role };
}

function adminClient() {
  return createClient(
    Deno.env.get('SUPABASE_URL')!,
    Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!,
    { auth: { persistSession: false } },
  );
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const authHeader = req.headers.get('Authorization') || '';
    if (!authHeader.startsWith('Bearer ')) {
      return json({ error: 'Não autorizado.' }, 401);
    }

    const caller = await getCallerProfile(authHeader);
    if (!caller) {
      return json({ error: 'Perfil não encontrado.' }, 403);
    }
    if (caller.role !== 'Admin') {
      return json({ error: 'Apenas administradores podem gerenciar usuários.' }, 403);
    }

    const body = await req.json();
    const action = body?.action;
    const admin = adminClient();

    if (action === 'create') {
      const nome = String(body?.nome ?? '').trim();
      const email = String(body?.email ?? '').trim().toLowerCase();
      const senha = String(body?.senha ?? '');
      const role = String(body?.role ?? 'Operador');

      if (!nome || !email || !senha) {
        return json({ error: 'Nome, email e senha são obrigatórios.' }, 400);
      }

      const { data, error } = await admin.auth.admin.createUser({
        email,
        password: senha,
        email_confirm: true,
        user_metadata: { nome, role, farm_id: caller.farm_id },
      });

      if (error) return json({ error: error.message }, 400);
      return json({ id: data.user.id });
    }

    if (action === 'update') {
      const id = String(body?.id ?? '');
      if (!id) return json({ error: 'ID do usuário é obrigatório.' }, 400);

      // Confirm the target belongs to the same farm (RLS-scoped read).
      const callerClient = createClient(
        Deno.env.get('SUPABASE_URL')!,
        Deno.env.get('SUPABASE_ANON_KEY') || Deno.env.get('SUPABASE_PUBLISHABLE_KEY')!,
        { global: { headers: { Authorization: authHeader } } },
      );
      const { data: target } = await callerClient
        .from('profiles')
        .select('id, farm_id')
        .eq('id', id)
        .maybeSingle();

      if (!target || target.farm_id !== caller.farm_id) {
        return json({ error: 'Usuário não pertence à sua fazenda.' }, 403);
      }

      const updates: Record<string, unknown> = {};
      if (body?.nome !== undefined) updates.nome = String(body.nome);
      if (body?.role !== undefined) updates.role = String(body.role);
      if (body?.status !== undefined) updates.status = String(body.status);

      if (Object.keys(updates).length > 0) {
        const { error: pErr } = await admin.from('profiles').update(updates).eq('id', id);
        if (pErr) return json({ error: pErr.message }, 400);
      }

      const senha = body?.senha ? String(body.senha) : '';
      if (senha) {
        const { error: aErr } = await admin.auth.admin.updateUserById(id, { password: senha });
        if (aErr) return json({ error: aErr.message }, 400);
      }

      return json({ ok: true });
    }

    if (action === 'delete') {
      const id = String(body?.id ?? '');
      if (!id) return json({ error: 'ID do usuário é obrigatório.' }, 400);

      const { data: { user } } = await createClient(
        Deno.env.get('SUPABASE_URL')!,
        Deno.env.get('SUPABASE_ANON_KEY') || Deno.env.get('SUPABASE_PUBLISHABLE_KEY')!,
        { global: { headers: { Authorization: authHeader } } },
      ).auth.getUser();

      if (user && id === user.id) {
        return json({ error: 'Você não pode remover a si mesmo.' }, 400);
      }

      const callerClient = createClient(
        Deno.env.get('SUPABASE_URL')!,
        Deno.env.get('SUPABASE_ANON_KEY') || Deno.env.get('SUPABASE_PUBLISHABLE_KEY')!,
        { global: { headers: { Authorization: authHeader } } },
      );
      const { data: target } = await callerClient
        .from('profiles')
        .select('id, farm_id')
        .eq('id', id)
        .maybeSingle();

      if (!target || target.farm_id !== caller.farm_id) {
        return json({ error: 'Usuário não pertence à sua fazenda.' }, 403);
      }

      const { error: dErr } = await admin.auth.admin.deleteUser(id);
      if (dErr) return json({ error: dErr.message }, 400);
      return json({ ok: true });
    }

    return json({ error: 'Ação inválida.' }, 400);
  } catch (e) {
    console.error('manage-team-user error:', e);
    return json({ error: 'Erro interno do servidor.' }, 500);
  }
});
