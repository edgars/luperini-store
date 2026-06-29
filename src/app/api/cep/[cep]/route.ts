import { NextResponse } from "next/server";

import { normalizeZipCode } from "@/lib/store/shipping-config";

type ViaCepResponse = {
  cep?: string;
  logradouro?: string;
  complemento?: string;
  bairro?: string;
  localidade?: string;
  uf?: string;
  erro?: boolean;
};

export async function GET(
  _request: Request,
  context: { params: Promise<{ cep: string }> },
) {
  const { cep: rawCep } = await context.params;
  const digits = rawCep.replace(/\D/g, "");

  if (digits.length !== 8) {
    return NextResponse.json({ error: "CEP inválido" }, { status: 400 });
  }

  try {
    const response = await fetch(`https://viacep.com.br/ws/${digits}/json/`, {
      next: { revalidate: 86400 },
    });

    if (!response.ok) {
      return NextResponse.json(
        { error: "Não foi possível consultar o CEP" },
        { status: 502 },
      );
    }

    const data = (await response.json()) as ViaCepResponse;

    if (data.erro) {
      return NextResponse.json({ error: "CEP não encontrado" }, { status: 404 });
    }

    return NextResponse.json({
      zipCode: normalizeZipCode(data.cep ?? digits),
      street: data.logradouro ?? "",
      complement: data.complemento ?? "",
      neighborhood: data.bairro ?? "",
      city: data.localidade ?? "",
      state: data.uf ?? "",
    });
  } catch {
    return NextResponse.json(
      { error: "Falha ao consultar ViaCEP" },
      { status: 502 },
    );
  }
}
