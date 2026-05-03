def test_invalid_route(client):
    res = client.get("/invalid")
    assert res.status_code == 404