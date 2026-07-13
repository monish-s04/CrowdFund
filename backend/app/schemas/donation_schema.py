from pydantic import BaseModel


class DonationCreate(BaseModel):
    campaign_id: int
    amount: float
    wallet_address: str
    transaction_hash: str


class DonationResponse(BaseModel):
    id: int
    campaign_id: int
    donor_id: int
    amount: float
    wallet_address: str
    transaction_hash: str

    class Config:
        from_attributes = True