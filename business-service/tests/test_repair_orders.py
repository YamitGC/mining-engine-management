def test_full_repair_order_lifecycle(client, auth_headers):
    # 1. Crear Cliente
    client_res = client.post("/api/clients", json={
        "name": "Minera del Norte",
        "id_type": "NIT",
        "id_number": "900999888-1",
        "email": "ops@mineranorte.com"
    }, headers=auth_headers)
    assert client_res.status_code == 201
    c_id = client_res.json()["id"]

    # 2. Crear Motor para ese cliente
    engine_res = client.post("/api/engines", json={
        "serial_number": "CAT-3516B-01",
        "manufacturer": "Caterpillar",
        "model": "3516B",
        "engine_type": "Diesel",
        "power_capacity": "2000 HP",
        "client_id": c_id
    }, headers=auth_headers)
    assert engine_res.status_code == 201
    e_id = engine_res.json()["id"]

    # 3. Crear Orden de Reparación
    order_payload = {
        "order_number": "ORD-2026-0001",
        "engine_id": e_id,
        "client_id": c_id,
        "problem_description": "Humo blanco excesivo y pérdida de potencia en camión minero",
        "assigned_technician": "Ing. Roberto Gómez",
        "status": "Recibido"
    }
    order_res = client.post("/api/repair-orders", json=order_payload, headers=auth_headers)
    assert order_res.status_code == 201
    order_data = order_res.json()
    assert order_data["order_number"] == "ORD-2026-0001"
    assert order_data["status"] == "Recibido"
    assert len(order_data["status_history"]) == 1
    order_id = order_data["id"]

    # 4. Cambiar Estado: 'Recibido' -> 'En diagnóstico'
    status_res1 = client.patch(
        f"/api/repair-orders/{order_id}/status",
        json={"status": "En diagnóstico", "notes": "Iniciando pruebas de compresión"},
        headers=auth_headers
    )
    assert status_res1.status_code == 200
    assert status_res1.json()["status"] == "En diagnóstico"

    # 5. Cambiar Estado: 'En diagnóstico' -> 'En reparación'
    status_res2 = client.patch(
        f"/api/repair-orders/{order_id}/status",
        json={"status": "En reparación", "notes": "Reemplazo de inyectores unitarios electrónicos"},
        headers=auth_headers
    )
    assert status_res2.status_code == 200
    assert status_res2.json()["status"] == "En reparación"

    # 6. Consultar Detalle Completo de la Orden y su Historial
    detail_res = client.get(f"/api/repair-orders/{order_id}", headers=auth_headers)
    assert detail_res.status_code == 200
    detail = detail_res.json()
    assert detail["order_number"] == "ORD-2026-0001"
    assert detail["client"]["name"] == "Minera del Norte"
    assert detail["engine"]["serial_number"] == "CAT-3516B-01"
    # Debe haber 3 entradas en el historial: Inicial (Recibido), Diagnóstico, Reparación
    assert len(detail["status_history"]) == 3

    # 7. Consultar Estadísticas del Dashboard
    stats_res = client.get("/api/repair-orders/summary/stats", headers=auth_headers)
    assert stats_res.status_code == 200
    stats = stats_res.json()
    assert stats["En reparación"] == 1
    assert stats["Finalizado"] == 0

def test_prevent_duplicate_order_number(client, auth_headers):
    client_res = client.post("/api/clients", json={
        "name": "Cliente Test",
        "id_type": "NIT",
        "id_number": "123456789-0",
        "email": "test@test.com"
    }, headers=auth_headers)
    c_id = client_res.json()["id"]

    engine_res = client.post("/api/engines", json={
        "serial_number": "SERIAL-ORD-TEST",
        "manufacturer": "Komatsu",
        "model": "SAA12V140E-3",
        "engine_type": "Diesel",
        "power_capacity": "1500 HP",
        "client_id": c_id
    }, headers=auth_headers)
    e_id = engine_res.json()["id"]

    order_payload = {
        "order_number": "ORD-DUPLICADA",
        "engine_id": e_id,
        "client_id": c_id,
        "problem_description": "Falla en alternador"
    }
    client.post("/api/repair-orders", json=order_payload, headers=auth_headers)

    dup_res = client.post("/api/repair-orders", json=order_payload, headers=auth_headers)
    assert dup_res.status_code == 409
    assert "Ya existe una orden de reparación" in dup_res.json()["detail"]

def test_validate_estimated_delivery_date_range(client, auth_headers):
    # 1. Setup client y engine
    c_res = client.post("/api/clients", json={
        "name": "Minera Fecha Test",
        "id_type": "NIT",
        "id_number": "888777666-5",
        "email": "fechas@minera.com"
    }, headers=auth_headers)
    c_id = c_res.json()["id"]

    e_res = client.post("/api/engines", json={
        "serial_number": "ENG-DATE-001",
        "manufacturer": "Caterpillar",
        "model": "3516B",
        "engine_type": "Diesel",
        "power_capacity": "2500 HP",
        "client_id": c_id
    }, headers=auth_headers)
    e_id = e_res.json()["id"]

    # 2. Fecha anterior al día de hoy debe ser rechazada (422)
    past_order = {
        "order_number": "ORD-PAST-001",
        "engine_id": e_id,
        "client_id": c_id,
        "problem_description": "Prueba de fecha pasada",
        "estimated_delivery_date": "2020-01-01T00:00:00Z"
    }
    past_res = client.post("/api/repair-orders", json=past_order, headers=auth_headers)
    assert past_res.status_code == 422

    # 3. Fecha superior al año 2100 debe ser rechazada (422)
    future_order = {
        "order_number": "ORD-FAR-FUTURE-001",
        "engine_id": e_id,
        "client_id": c_id,
        "problem_description": "Prueba de fecha año 2105",
        "estimated_delivery_date": "2105-01-01T00:00:00Z"
    }
    future_res = client.post("/api/repair-orders", json=future_order, headers=auth_headers)
    assert future_res.status_code == 422

    # 4. Fecha válida (año 2030) debe ser aceptada (201)
    valid_order = {
        "order_number": "ORD-VALID-DATE-001",
        "engine_id": e_id,
        "client_id": c_id,
        "problem_description": "Prueba de fecha válida",
        "estimated_delivery_date": "2030-06-15T12:00:00Z"
    }
    valid_res = client.post("/api/repair-orders", json=valid_order, headers=auth_headers)
    assert valid_res.status_code == 201
    assert valid_res.json()["estimated_delivery_date"] is not None
