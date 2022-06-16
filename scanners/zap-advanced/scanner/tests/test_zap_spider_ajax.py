#!/usr/bin/env python

# SPDX-FileCopyrightText: the secureCodeBox authors
#
# SPDX-License-Identifier: Apache-2.0

# -*- coding: utf-8 -*-

import pytest

from unittest.mock import MagicMock, Mock
from unittest import TestCase

from zapclient.configuration import ZapConfiguration
from zapclient.spider.zap_spider_ajax import ZapConfigureSpiderAjax

class ZapSpiderAjaxTests(TestCase):

    @pytest.mark.unit
    def test_has_spider_configurations(self):
        config = ZapConfiguration("./tests/mocks/context-with-overlay/", "https://www.secureCodeBox.io/")
        self.assertIsNone(config.get_active_spider_config)

        config = ZapConfiguration("./tests/mocks/scan-full-juiceshop-docker/", "http://juiceshop:3000/")
        self.assertIsNotNone(config.get_active_spider_config)
