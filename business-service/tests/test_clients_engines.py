def test_health_check(client):
    response = client.get("/health")
    assert response.status_code == 200
    assert response.json()["status"] == "healthy"

def test_protected_route_without_token(client):
    response = client.post("/api/clients", json={
        "name": "Minera San Jorge",
        "id_type": "NIT",
        "id_number": "900123456-1",
        "email": "contacto@sanjorge.com"
    })
    assert response.status_code == 401
    assert "Token de autenticación no proporcionado" in response.json()["detail"]

def test_create_and_get_client_success(client, auth_headers):
    # 1. Crear cliente
    payload = {
        "name": "Minera San Jorge",
        "id_type": "NIT",
        "id_number": "900123456-1",
        "email": "contacto@sanjorge.com",
        "phone": "+57 300 123 4567"
    }
    response = client.post("/api/clients", json=payload, headers=auth_headers)
    assert response.status_code == 201
    data = response.json()
    assert data["name"] == "Minera San Jorge"
    assert data["id_number"] == "900123456-1"
    assert data["is_active"] is True
    client_id = data["id"]
    
    # 2. Obtener lista de clientes
    list_res = client.get("/api/clients", headers=auth_headers)
    assert list_res.status_code == 200
    assert len(list_res.json()) == 1

    # 3. Obtener cliente por ID
    get_res = client.get(f"/api/clients/{client_id}", headers=auth_headers)
    assert get_res.status_code == 200
    assert get_res.json()["name"] == "Minera San Jorge"

def test_prevent_duplicate_client_id_number(client, auth_headers):
    payload = {
        "name": "Minera San Jorge",
        "id_type": "NIT",
        "id_number": "900123456-1",
        "email": "contacto@sanjorge.com"
    }
    client.post("/api/clients", json=payload, headers=auth_headers)
    
    duplicate_res = client.post("/api/clients", json={
        "name": "Otra Minera",
        "id_type": "NIT",
        "id_number": "900123456-1",
        "email": "otra@minera.com"
    }, headers=auth_headers)
    
    assert duplicate_res.status_code == 409
    assert "Ya existe un cliente registrado" in duplicate_res.json()["detail"]

def test_create_engine_success(client, auth_headers):
    client_res = client.post("/api/clients", json={
        "name": "Cerromatoso S.A.",
        "id_type": "NIT",
        "id_number": "890123456-2",
        "email": "logistica@cerromatoso.com"
    }, headers=auth_headers)
    c_id = client_res.json()["id"]
    
    engine_payload = {
        "serial_number": "CAT-C175-9988",
        "manufacturer": "Caterpillar",
        "model": "C175-16",
        "engine_type": "Diesel Turboalimentado",
        "power_capacity": "3500 HP",
        "client_id": c_id
    }
    response = client.post("/api/engines", json=engine_payload, headers=auth_headers)
    assert response.status_code == 201
    engine_data = response.json()
    assert engine_data["serial_number"] == "CAT-C175-9988"
    assert engine_data["client_id"] == c_id

def test_prevent_duplicate_engine_serial(client, auth_headers):
    client_res = client.post("/api/clients", json={
        "name": "Drummond Ltd",
        "id_type": "NIT",
        "id_number": "860456789-3",
        "email": "ops@drummond.com"
    }, headers=auth_headers)
    c_id = client_res.json()["id"]
    
    engine_payload = {
        "serial_number": "QSK60-DRUMMOND-01",
        "manufacturer": "Cummins",
        "model": "QSK60",
        "engine_type": "Diesel V16",
        "power_capacity": "2700 HP",
        "client_id": c_id
    }
    client.post("/api/engines", json=engine_payload, headers=auth_headers)
    
    dup_res = client.post("/api/engines", json=engine_payload, headers=auth_headers)
    assert dup_res.status_code == 409
    assert "Ya existe un motor registrado" in dup_res.json()["detail"]
