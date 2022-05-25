from fastapi import APIRouter, Depends, File, Query
from backend.bg import remove
from backend.session_base import BaseSession
from backend.session_factory import new_session
from enum import Enum
from starlette.responses import Response
from asyncer import asyncify

router = APIRouter()

sessions: dict[str, BaseSession] = {}
tags_metadata = [
    {
        "name": "Background Removal",
        "description": "Endpoints that perform background removal with different image sources. Based on original rembg repository.",
        "externalDocs": {
            "description": "GitHub Source",
            "url": "https://github.com/refansa/rembg",
        },
    },
]


class ModelType(str, Enum):
    u2net = "u2net"
    u2netp = "u2netp"
    u2net_human_seg = "u2net_human_seg"


class CommonQueryParams:
    def __init__(
        self,
        model: ModelType = Query(
            default=ModelType.u2net,
            description="Model to use when processing image",
        ),
        a: bool = Query(default=False, description="Enable Alpha Matting"),
        af: int = Query(
            default=240, ge=0, description="Alpha Matting (Foreground Threshold)"
        ),
        ab: int = Query(
            default=10, ge=0, description="Alpha Matting (Background Threshold)"
        ),
        ae: int = Query(
            default=10, ge=0, description="Alpha Matting (Erode Structure Size)"
        ),
        om: bool = Query(default=False, description="Only Mask"),
    ):
        self.model = model
        self.a = a
        self.af = af
        self.ab = ab
        self.ae = ae
        self.om = om


def im_without_bg(content: bytes, commons: CommonQueryParams) -> Response:
    return Response(
        remove(
            content,
            session=sessions.setdefault(
                commons.model.value, new_session(commons.model.value)
            ),
            alpha_matting=commons.a,
            alpha_matting_foreground_threshold=commons.af,
            alpha_matting_background_threshold=commons.ab,
            alpha_matting_erode_size=commons.ae,
            only_mask=commons.om,
        ),
        media_type="image/png",
    )


@router.post(
    path="/",
    tags=["Background Removal"],
    summary="Remove from Stream",
    description="Removes the background from an image sent within the request itself.",
)
async def post_index(
    file: bytes = File(
        default=...,
        description="Image file (byte stream) that has to be processed.",
    ),
    commons: CommonQueryParams = Depends(),
):
    return await asyncify(im_without_bg)(file, commons)
