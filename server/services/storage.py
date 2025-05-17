import logging
import mimetypes
import os
import uuid
from typing import Optional

import boto3
import requests
from botocore.exceptions import ClientError
from config import S3Config, settings


class Storage:
    def __init__(self, cfg: Optional[S3Config] = None):
        self.cfg = cfg or settings.S3_CONFIG
        try:
            self.session = boto3.Session(
                aws_access_key_id=self.cfg.access_key_id,
                aws_secret_access_key=self.cfg.secret_key,
                region_name=self.cfg.region,
            )
            self.s3_client = self.session.client(
                "s3", endpoint_url=self.cfg.endpoint_url
            )
            self.root_dir = self.cfg.root_directory.rstrip("/")
        except Exception as e:
            raise RuntimeError(f"Failed to create AWS session: {e}")

    def save_image_by_url(self, image_url: str, key: Optional[str] = None) -> str:
        try:
            resp = requests.get(image_url, timeout=10, stream=True)
            resp.raise_for_status()
            data = resp.content

            content_type = resp.headers.get("Content-Type", "application/octet-stream")
            ext = (
                mimetypes.guess_extension(content_type)
                or os.path.splitext(image_url)[1]
                or ".jpg"
            )

            return self._upload(data, key, content_type, ext)
        except Exception as e:
            raise RuntimeError(f"Failed to process image {image_url}: {e}")

    def save_image_by_bytes(self, image_data: bytes, key: Optional[str] = None) -> str:
        return self._upload(
            image_data,
            key,
            content_type="application/octet-stream",
            ext=".bin",
        )

    def _upload(
        self,
        data: bytes,
        key: Optional[str],
        content_type: str,
        ext: str,
    ) -> str:
        if not key:
            key = uuid.uuid4().hex
        key = f"{self.root_dir}/{key}{ext}"

        try:
            self.s3_client.put_object(
                Bucket=self.cfg.bucket,
                Key=key,
                Body=data,
                ContentType=content_type,
            )
            url = f"{self.cfg.endpoint_url.rstrip('/')}/{self.cfg.bucket}/{key}"
            logging.info(f"Uploaded image to {url}")
            return url
        except ClientError as e:
            raise RuntimeError(f"Failed to upload to S3: {e}")
