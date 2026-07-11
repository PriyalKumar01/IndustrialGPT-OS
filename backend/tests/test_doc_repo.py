import pytest
from app.repositories.doc_repo import DocumentRepository

@pytest.mark.asyncio
async def test_get_all_documents():
    repo = DocumentRepository()
    docs = await repo.get_all()
    assert isinstance(docs, list)
    assert len(docs) == 0
