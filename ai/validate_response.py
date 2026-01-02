def validate_response(response_text, project_map):
    errors = []

    for file in project_map["files"]:
        if file["path"] in response_text:
            break
    else:
        errors.append("❌ Nenhum arquivo válido do project_map foi citado")

    forbidden_words = ["useRouter", "params.get", "NextPage", "Flutter Widget"]
    for word in forbidden_words:
        if word in response_text:
            errors.append(f"❌ Uso de API/framework não garantido: {word}")

    return errors
